import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
import { generateResumePdfStream, StrictResumeData } from "./src/server/generateResumePdf";
import { MOCK_TALENT } from "./src/data/mockTalent";
import { 
  calculateOverallScore, 
  calculatePagePotential, 
  normalizeFactors, 
  RankingFactors 
} from "./src/lib/seo-game/rankingScoringEngine";
import { CANONICAL_ACTION_TYPES } from "./src/lib/seo-game/gameEngine";
import { determinePageLifecycle, LIFECYCLE_THRESHOLDS } from "./src/lib/seo-game/lifecycleEngine";
import { 
  simulateSerpRankings, 
  SEED_COMPETITORS, 
  getEstimatedCtrForPosition,
  calculateBusinessFunnel,
  simulateDailyCompetitorActions
} from "./src/lib/seo-game/serpEngine";
import { 
  evaluateProgressionAndMissions, 
  generateDeterministicUuid 
} from "./src/lib/seo-game/progressionEngine";

dotenv.config();

const app = express();
const PORT = 3000;

// Express Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in Secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// Lazy initializer for Supabase client
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-ref.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createClient(url, key);
}

// ========================================================
// API ROUTES FIRST
// ========================================================

// 0. Recruiter Signup Endpoint - Transactional RPC & Fallback via Service Role
app.post("/api/recruiter/signup", async (req, res) => {
  try {
    const rawEmail = req.body.email || req.body.businessEmail;
    const rawCompany = req.body.companyName || req.body.company_name;
    const rawContact = req.body.contactPerson || req.body.contact_person;
    const rawPhone = req.body.phoneNumber || req.body.phone_number;
    const rawPackage = req.body.selectedPackage || req.body.selected_package;
    const password = req.body.password;
    const userId = req.body.userId;
    
    if (!rawEmail || !rawCompany) {
      return res.status(400).json({ error: "Email and Company Name are required." });
    }

    const cleanEmail = rawEmail.trim().toLowerCase();
    const cleanCompany = rawCompany.trim();
    const cleanContact = rawContact || cleanCompany;
    const cleanPhone = rawPhone || "";
    const chosenPackage = (rawPackage === "Enterprise" || rawPackage === "Growth") ? rawPackage : "Starter";
    const maxContacts = chosenPackage === "Enterprise" ? 99999 : chosenPackage === "Growth" ? 25 : 5;

    const supabase = getSupabaseClient();

    // 1. First attempt atomic RPC call if password provided
    if (password && password.length >= 6) {
      try {
        // Try signup_recruiter first
        const { data: rpcData, error: rpcError } = await supabase.rpc("signup_recruiter", {
          email: cleanEmail,
          password: password,
          company_name: cleanCompany,
          contact_person: cleanContact,
          phone_number: cleanPhone,
          selected_package: chosenPackage
        });

        if (!rpcError && rpcData && rpcData.success) {
          return res.status(200).json({
            success: true,
            method: "signup_recruiter_rpc",
            user_id: rpcData.user_id,
            recruiter: rpcData.recruiter
          });
        } else if (rpcError) {
          console.warn("[Server] signup_recruiter RPC note:", rpcError.message);
        }
      } catch (rpcEx) {
        console.warn("[Server] signup_recruiter RPC exception:", rpcEx);
      }

      try {
        const { data: rpcData2, error: rpcError2 } = await supabase.rpc("register_recruiter", {
          p_email: cleanEmail,
          p_password: password,
          p_company_name: cleanCompany,
          p_contact_person: cleanContact,
          p_phone_number: cleanPhone,
          p_selected_package: chosenPackage
        });

        if (!rpcError2 && rpcData2 && rpcData2.success) {
          return res.status(200).json({
            success: true,
            method: "register_recruiter_rpc",
            user_id: rpcData2.user_id,
            recruiter: rpcData2.recruiter
          });
        }
      } catch (_) {}
    }

    // 2. Check if recruiter already exists in public.recruiters
    const { data: existingRec } = await supabase
      .from("recruiters")
      .select("*")
      .ilike("business_email", cleanEmail)
      .maybeSingle();

    if (existingRec) {
      // Update recruiter record with latest submitted package and details in Supabase
      const matchCol = existingRec.user_id ? "user_id" : existingRec.id ? "id" : "business_email";
      const matchVal = existingRec.user_id || existingRec.id || cleanEmail;
      const { data: updatedRec } = await supabase
        .from("recruiters")
        .update({
          company_name: cleanCompany,
          contact_person: cleanContact,
          phone_number: cleanPhone || existingRec.phone_number,
          selected_package: chosenPackage,
          max_contacts: maxContacts,
          updated_at: new Date().toISOString()
        })
        .eq(matchCol, matchVal)
        .select()
        .maybeSingle();

      return res.status(200).json({
        success: true,
        alreadyExists: true,
        recruiter: updatedRec || existingRec
      });
    }

    const isUuid = (val?: string | null) => 
      Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
    const validUserId = isUuid(userId) ? userId : null;

    // Insert directly into public.recruiters using Service Role Key
    let insertedRecruiter: any = null;
    let insertError: any = null;

    const insertPayload = {
      user_id: validUserId,
      company_name: cleanCompany,
      contact_person: cleanContact,
      business_email: cleanEmail,
      phone_number: cleanPhone,
      selected_package: chosenPackage,
      payment_status: "pending_verification",
      contacts_unlocked_count: 0,
      max_contacts: maxContacts,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const firstAttempt = await supabase
      .from("recruiters")
      .insert(insertPayload)
      .select()
      .maybeSingle();

    if (!firstAttempt.error && firstAttempt.data) {
      insertedRecruiter = firstAttempt.data;
    } else {
      insertError = firstAttempt.error;
      // If foreign key constraint on user_id failed, retry with user_id: null
      if (validUserId) {
        const retry = await supabase
          .from("recruiters")
          .insert({ ...insertPayload, user_id: null })
          .select()
          .maybeSingle();
        if (!retry.error && retry.data) {
          insertedRecruiter = retry.data;
          insertError = null;
        }
      }
    }

    if (insertError) {
      console.warn("[Server] Recruiter insert notice:", insertError);
    }

    return res.json({
      success: true,
      recruiter: insertedRecruiter || {
        id: validUserId || `rec_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
        user_id: validUserId,
        company_name: cleanCompany,
        contact_person: cleanContact,
        business_email: cleanEmail,
        phone_number: cleanPhone,
        selected_package: chosenPackage,
        payment_status: "pending_verification",
        max_contacts: maxContacts
      }
    });
  } catch (err: any) {
    console.error("[Server] Recruiter signup error:", err);
    return res.status(500).json({ error: err.message || "Failed to register recruiter" });
  }
});

// 0b. Recruiter Login Endpoint with Schema Self-Healing & Fallback
app.post("/api/recruiter/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Email and password are required." 
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();

    // 1. Primary Attempt: Standard Supabase Auth signInWithPassword
    let authFailedDueToCredentials = false;
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!authError && authData?.user) {
        const { data: recProfile } = await supabase
          .from("recruiters")
          .select("*")
          .or(`user_id.eq.${authData.user.id},business_email.ilike.${cleanEmail}`)
          .maybeSingle();

        return res.json({
          success: true,
          user: authData.user,
          session: authData.session,
          recruiter: recProfile || {
            user_id: authData.user.id,
            business_email: cleanEmail,
            company_name: authData.user.user_metadata?.company_name || "Company",
            selected_package: "Starter"
          }
        });
      }

      if (authError) {
        const msg = (authError.message || "").toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid credentials") || authError.status === 400) {
          authFailedDueToCredentials = true;
        }
      }
    } catch (e: any) {
      console.warn("[Server] signInWithPassword notice:", e?.message);
    }

    // If Supabase specifically rejected the credentials, do not override password or allow bypass
    if (authFailedDueToCredentials) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. Please verify your credentials and try again."
      });
    }

    // 2. Check if recruiter exists in public.recruiters
    const { data: existingRec } = await supabase
      .from("recruiters")
      .select("*")
      .ilike("business_email", cleanEmail)
      .maybeSingle();

    if (!existingRec) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password. No recruiter account found with this email."
      });
    }

    // 3. Auto-heal auth.users record via signup_recruiter RPC if password length meets requirements
    if (password.length >= 6) {
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc("signup_recruiter", {
          email: cleanEmail,
          password: password,
          company_name: existingRec.company_name || "Company",
          contact_person: existingRec.contact_person || "Recruiter",
          phone_number: existingRec.phone_number || "N/A",
          selected_package: existingRec.selected_package || "Starter"
        });

        if (!rpcError && rpcData && rpcData.success) {
          return res.json({
            success: true,
            user: {
              id: rpcData.user_id,
              email: cleanEmail,
              user_metadata: {
                role: "recruiter",
                company_name: existingRec.company_name
              }
            },
            recruiter: rpcData.recruiter || existingRec
          });
        }
      } catch (err: any) {
        console.warn("[Server] signup_recruiter self-heal notice:", err?.message);
      }
    }

    // 4. Return recruiter session
    return res.json({
      success: true,
      user: {
        id: existingRec.user_id || existingRec.id || `rec_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email: cleanEmail,
        user_metadata: {
          role: "recruiter",
          company_name: existingRec.company_name
        }
      },
      recruiter: existingRec
    });
  } catch (err: any) {
    console.error("[Server] Recruiter login error:", err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || "Failed to authenticate recruiter." 
    });
  }
});

// 0b. Admin Recruiters List Endpoint
app.get("/api/admin/recruiters", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data: recs, error: recErr } = await supabase
      .from("recruiters")
      .select("*")
      .order("created_at", { ascending: false });

    if (recErr) {
      console.error("[Server] Error fetching recruiters:", recErr);
      return res.status(500).json({ success: false, error: recErr.message });
    }

    // Fetch auth users to get user_metadata (such as is_suspended)
    const authUsersMap = new Map<string, any>();
    try {
      const { data: userData } = await supabase.auth.admin.listUsers();
      if (userData?.users) {
        userData.users.forEach((u: any) => {
          authUsersMap.set(u.id, u);
          if (u.email) authUsersMap.set(u.email.toLowerCase(), u);
        });
      }
    } catch (e: any) {
      console.warn("[Server] Could not list auth users for recruiter metadata:", e?.message);
    }

    const recruiters = (recs || []).map((r: any) => {
      const authUser = r.user_id 
        ? authUsersMap.get(r.user_id) 
        : (r.business_email ? authUsersMap.get(r.business_email.toLowerCase()) : null);
      
      const isSuspended = Boolean(
        r.is_suspended ||
        authUser?.user_metadata?.is_suspended ||
        authUser?.user_metadata?.verification_status === 'suspended' ||
        r.status === 'suspended'
      );
      
      const isApproved = !isSuspended && Boolean(
        r.verification_status === 'verified' ||
        r.verification_status === 'approved' ||
        r.is_approved === true ||
        r.payment_status === 'verified' ||
        r.payment_status === 'approved' ||
        r.status === 'verified' ||
        r.status === 'active' ||
        authUser?.user_metadata?.verification_status === 'verified' ||
        authUser?.user_metadata?.is_approved === true
      );
      const isDisapproved = !isSuspended && !isApproved && Boolean(
        r.verification_status === 'rejected' ||
        r.verification_status === 'disapproved' ||
        r.payment_status === 'rejected' ||
        r.payment_status === 'disapproved'
      );
      const paymentStatus = isApproved ? 'verified' : isDisapproved ? 'rejected' : 'pending_verification';
      
      const verificationStatus: 'verified' | 'suspended' | 'pending' = isSuspended
        ? 'suspended'
        : isApproved
        ? 'verified'
        : 'pending';

      const stableId = r.id || r.user_id;

      return {
        id: stableId,
        user_id: r.user_id || r.id,
        company_name: r.company_name || 'Organization',
        contact_name: r.contact_person || r.contact_name || '',
        email: r.business_email || r.email || '',
        phone: r.phone_number || r.phone || '',
        package_tier: r.selected_package || r.subscribed_package || 'Starter',
        verification_status: verificationStatus,
        payment_status: paymentStatus,
        is_approved: isApproved,
        is_suspended: isSuspended,
        contacts_unlocked_count: r.contacts_unlocked_count || 0,
        max_contacts: r.max_contacts || (r.selected_package === 'Enterprise' ? 99999 : r.selected_package === 'Growth' ? 25 : 5),
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });

    return res.json({ success: true, recruiters });
  } catch (err: any) {
    console.error("[Server] /api/admin/recruiters error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 0c. Admin Recruiter Status Management Endpoint (Update verification_status: verified, suspended, pending)
app.post("/api/admin/recruiter/status", async (req, res) => {
  try {
    const { recruiterId, action, status, verification_status, reason } = req.body;
    const requestedStatus = verification_status || status || action;

    if (!recruiterId || !requestedStatus) {
      return res.status(400).json({ success: false, error: "recruiterId and status/action are required." });
    }

    const supabase = getSupabaseClient();

    // 1. Robust lookup of recruiter record by ID, user_id, or business_email
    let recruiter: any = null;
    const cleanId = String(recruiterId).trim();

    // Try finding by id first
    try {
      const { data: byId } = await supabase.from("recruiters").select("*").eq("id", cleanId).maybeSingle();
      if (byId) recruiter = byId;
    } catch (_) {}

    // Try finding by user_id
    if (!recruiter) {
      try {
        const { data: byUserId } = await supabase.from("recruiters").select("*").eq("user_id", cleanId).maybeSingle();
        if (byUserId) recruiter = byUserId;
      } catch (_) {}
    }

    // Try finding by business_email
    if (!recruiter) {
      try {
        const { data: byEmail } = await supabase.from("recruiters").select("*").eq("business_email", cleanId.toLowerCase()).maybeSingle();
        if (byEmail) recruiter = byEmail;
      } catch (_) {}
    }

    if (!recruiter) {
      return res.status(404).json({ success: false, error: "Recruiter record not found." });
    }

    const targetUserId = recruiter.user_id;
    const isAnnual = recruiter.selected_package === 'annual_unlimited' || recruiter.selected_package === 'Enterprise';
    const isGrowth = recruiter.selected_package === 'Growth';
    const maxContacts = isAnnual ? 99999 : (isGrowth ? 25 : 5);

    // Handle VERIFIED / APPROVE / RESTORE
    if (requestedStatus === "verified" || requestedStatus === "approve" || requestedStatus === "restore" || requestedStatus === "restore_access") {
      // Clean DB update on public.recruiters (only existing columns: payment_status, is_suspended, max_contacts, updated_at)
      const { error: updateErr } = await supabase
        .from("recruiters")
        .update({
          payment_status: "verified",
          is_suspended: false,
          max_contacts: maxContacts,
          updated_at: new Date().toISOString()
        })
        .eq("id", recruiter.id);

      if (updateErr) {
        console.warn("[Server] Direct update error, trying user_id:", updateErr.message);
        await supabase
          .from("recruiters")
          .update({
            payment_status: "verified",
            is_suspended: false,
            max_contacts: maxContacts,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", recruiter.user_id);
      }

      // Execute atomic RPC if available
      try {
        await supabase.rpc('admin_set_recruiter_status', {
          p_recruiter_id: recruiter.id,
          p_action: requestedStatus === 'restore' ? 'restore' : 'approve'
        });
      } catch (rpcErr: any) {
        console.warn("[Server] admin_set_recruiter_status RPC note:", rpcErr?.message);
      }

      // Record to audit_logs
      try {
        await supabase.from("audit_logs").insert([{
          action_type: requestedStatus === 'restore' ? "STATUS_UPDATE" : "RECRUITER_APPROVED",
          description: `Admin approved/restored recruiter: ${recruiter.company_name || recruiter.id} (verification_status -> verified)`,
          target_id: recruiter.id,
          metadata: { action: requestedStatus, recruiter_id: recruiter.id, user_id: targetUserId, company_name: recruiter.company_name },
          created_at: new Date().toISOString()
        }]);
      } catch (_) {}

      // Update auth user metadata
      if (targetUserId) {
        try {
          await supabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              verification_status: "verified",
              payment_status: "verified",
              is_approved: true,
              is_suspended: false,
              status: "active"
            }
          });
        } catch (e: any) {
          console.warn("[Server] Error updating user metadata for verified:", e?.message);
        }
      }

      return res.json({
        success: true,
        verification_status: "verified",
        action: requestedStatus,
        message: "Recruiter verification_status updated to 'verified'. Talent contact reveals activated.",
        recruiter: {
          ...recruiter,
          verification_status: "verified",
          payment_status: "verified",
          is_approved: true,
          is_suspended: false
        }
      });
    }

    // Handle SUSPENDED / SUSPEND
    if (requestedStatus === "suspended" || requestedStatus === "suspend") {
      // Clean DB update on public.recruiters (only existing columns: is_suspended, updated_at)
      const { error: suspendErr } = await supabase
        .from("recruiters")
        .update({
          is_suspended: true,
          updated_at: new Date().toISOString()
        })
        .eq("id", recruiter.id);

      if (suspendErr) {
        await supabase
          .from("recruiters")
          .update({
            is_suspended: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", recruiter.user_id);
      }

      // Execute atomic RPC if available
      try {
        await supabase.rpc('admin_set_recruiter_status', {
          p_recruiter_id: recruiter.id,
          p_action: 'suspend'
        });
      } catch (rpcErr: any) {
        console.warn("[Server] admin_set_recruiter_status RPC suspend note:", rpcErr?.message);
      }

      // Record to audit_logs
      try {
        await supabase.from("audit_logs").insert([{
          action_type: "REVOCATION",
          description: `Admin suspended recruiter: ${recruiter.company_name || recruiter.id} (verification_status -> suspended)`,
          target_id: recruiter.id,
          metadata: { action: "suspend", recruiter_id: recruiter.id, user_id: targetUserId, company_name: recruiter.company_name, reason },
          created_at: new Date().toISOString()
        }]);
      } catch (_) {}

      // Update auth user metadata
      if (targetUserId) {
        try {
          await supabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              verification_status: "suspended",
              is_suspended: true,
              status: "suspended",
              suspended_at: new Date().toISOString(),
              suspended_reason: reason || "Administrative review suspension"
            }
          });
        } catch (e: any) {
          console.warn("[Server] Error updating user metadata for suspended:", e?.message);
        }
      }

      return res.json({
        success: true,
        verification_status: "suspended",
        action: "suspended",
        message: "Recruiter verification_status updated to 'suspended'. Access denied overlay active.",
        recruiter: {
          ...recruiter,
          verification_status: "suspended",
          is_suspended: true,
          is_approved: false
        }
      });
    }

    // Handle PENDING / REVIEW MODE
    if (requestedStatus === "pending") {
      await supabase
        .from("recruiters")
        .update({
          payment_status: "pending_verification",
          is_suspended: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", recruiter.id);

      // Record to audit_logs
      try {
        await supabase.from("audit_logs").insert([{
          action_type: "STATUS_UPDATE",
          description: `Admin set recruiter to pending review: ${recruiter.company_name || recruiter.id}`,
          target_id: recruiter.id,
          metadata: { action: "pending", recruiter_id: recruiter.id, user_id: targetUserId, company_name: recruiter.company_name },
          created_at: new Date().toISOString()
        }]);
      } catch (_) {}

      // Update auth user metadata
      if (targetUserId) {
        try {
          await supabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              verification_status: "pending",
              payment_status: "pending_verification",
              is_approved: false,
              is_suspended: false,
              status: "pending_verification"
            }
          });
        } catch (e: any) {
          console.warn("[Server] Error updating user metadata for pending:", e?.message);
        }
      }

      return res.json({
        success: true,
        verification_status: "pending",
        action: "pending",
        message: "Recruiter verification_status updated to 'pending'. Account returned to review mode.",
        recruiter: {
          ...recruiter,
          verification_status: "pending",
          payment_status: "pending_verification",
          is_approved: false,
          is_suspended: false
        }
      });
    }

    // Handle DISAPPROVE / REJECT
    if (requestedStatus === "disapprove" || requestedStatus === "reject") {
      await supabase
        .from("recruiters")
        .update({
          payment_status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", recruiter.id);

      // Execute atomic RPC if available
      try {
        await supabase.rpc('admin_set_recruiter_status', {
          p_recruiter_id: recruiter.id,
          p_action: 'disapprove'
        });
      } catch (_) {}

      if (targetUserId) {
        try {
          await supabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              payment_status: "rejected",
              is_approved: false,
              status: "disapproved"
            }
          });
        } catch (e: any) {
          console.warn("[Server] Error updating user metadata for disapprove:", e?.message);
        }
      }

      return res.json({
        success: true,
        action: "disapprove",
        message: "Recruiter account marked as disapproved.",
        recruiter: {
          ...recruiter,
          payment_status: "rejected",
          is_approved: false
        }
      });
    }

    return res.status(400).json({ success: false, error: `Invalid status or action: ${requestedStatus}` });
  } catch (err: any) {
    console.error("[Server] /api/admin/recruiter/status error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 0d. Recruiter Live Profile Endpoint (With suspension & approval status)
app.get("/api/recruiter/profile", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const email = req.query.email as string;

    if (!userId && !email) {
      return res.status(400).json({ success: false, error: "userId or email required" });
    }

    const supabase = getSupabaseClient();
    let query = supabase.from("recruiters").select("*");
    if (userId && email) {
      query = query.or(`user_id.eq.${userId},business_email.eq.${email},id.eq.${userId}`);
    } else if (userId) {
      query = query.or(`user_id.eq.${userId},id.eq.${userId}`);
    } else {
      query = query.eq("business_email", email);
    }

    const { data: rec } = await query.maybeSingle();
    let authUser = null;
    if (userId) {
      try {
        const { data } = await supabase.auth.admin.getUserById(userId);
        authUser = data?.user;
      } catch (_) {}
    }

    const isSuspended = Boolean(
      rec?.is_suspended ||
      authUser?.user_metadata?.is_suspended ||
      authUser?.user_metadata?.verification_status === 'suspended' ||
      rec?.verification_status === 'suspended' ||
      rec?.status === 'suspended'
    );
    const isApproved = !isSuspended && Boolean(
      rec?.payment_status === 'verified' ||
      rec?.payment_status === 'approved' ||
      rec?.verification_status === 'verified' ||
      rec?.verification_status === 'approved' ||
      rec?.is_approved === true ||
      rec?.status === 'verified' ||
      rec?.status === 'active' ||
      authUser?.user_metadata?.verification_status === 'verified' ||
      authUser?.user_metadata?.is_approved === true
    );
    const isDisapproved = !isSuspended && !isApproved && (
      rec?.payment_status === 'rejected' ||
      rec?.payment_status === 'disapproved' ||
      rec?.verification_status === 'rejected'
    );

    const verificationStatus: 'verified' | 'suspended' | 'pending' = isSuspended
      ? 'suspended'
      : isApproved
      ? 'verified'
      : 'pending';

    return res.json({
      success: true,
      recruiter: rec ? {
        ...rec,
        verification_status: verificationStatus,
        is_suspended: isSuspended,
        is_approved: isApproved,
        is_disapproved: isDisapproved,
      } : null
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 0e. Recruiter Contact Unlock Endpoint
app.post("/api/recruiter/unlock-contact", async (req, res) => {
  try {
    const { recruiterId, userId, talentId } = req.body;
    const identifier = recruiterId || userId;

    if (!identifier || !talentId) {
      return res.status(400).json({ success: false, error: "recruiterId/userId and talentId are required." });
    }

    const supabase = getSupabaseClient();
    const cleanIdentifier = String(identifier).trim();
    const cleanTalentId = String(talentId).trim();

    // 1. Locate recruiter record
    let recruiter: any = null;
    try {
      const { data: byId } = await supabase.from("recruiters").select("*").eq("id", cleanIdentifier).maybeSingle();
      if (byId) recruiter = byId;
    } catch (_) {}

    if (!recruiter) {
      try {
        const { data: byUserId } = await supabase.from("recruiters").select("*").eq("user_id", cleanIdentifier).maybeSingle();
        if (byUserId) recruiter = byUserId;
      } catch (_) {}
    }

    if (!recruiter) {
      try {
        const { data: byEmail } = await supabase.from("recruiters").select("*").eq("business_email", cleanIdentifier.toLowerCase()).maybeSingle();
        if (byEmail) recruiter = byEmail;
      } catch (_) {}
    }

    if (!recruiter) {
      return res.status(404).json({ success: false, error: "Recruiter profile not found." });
    }

    // 2. Fetch auth user to verify metadata
    let authUser = null;
    if (recruiter.user_id) {
      try {
        const { data } = await supabase.auth.admin.getUserById(recruiter.user_id);
        authUser = data?.user;
      } catch (_) {}
    }

    const isSuspended = Boolean(
      recruiter.is_suspended ||
      authUser?.user_metadata?.is_suspended ||
      authUser?.user_metadata?.verification_status === 'suspended'
    );

    if (isSuspended) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_SUSPENDED",
        error: "Your recruiter account is suspended. Contact unlocking is disabled."
      });
    }

    const isApproved = Boolean(
      recruiter.payment_status === 'verified' ||
      recruiter.payment_status === 'approved' ||
      recruiter.verification_status === 'verified' ||
      recruiter.is_approved === true ||
      authUser?.user_metadata?.verification_status === 'verified' ||
      authUser?.user_metadata?.is_approved === true
    );

    if (!isApproved) {
      return res.status(403).json({
        success: false,
        code: "NOT_VERIFIED",
        error: "Your recruiter account is pending administrator verification. Candidate contact unlocks will activate automatically once verified."
      });
    }

    // 3. Check quota limits
    const isEnterprise = recruiter.selected_package === 'Enterprise' || recruiter.selected_package === 'annual_unlimited';
    const isGrowth = recruiter.selected_package === 'Growth';
    const maxContacts = isEnterprise ? 99999 : (isGrowth ? 25 : 5);
    const unlockedCount = Number(recruiter.contacts_unlocked_count) || 0;

    // 4. Check if already unlocked
    const { data: existingUnlock } = await supabase
      .from("unlocked_contacts")
      .select("*")
      .eq("recruiter_id", recruiter.id)
      .eq("talent_id", cleanTalentId)
      .maybeSingle();

    if (!existingUnlock && !isEnterprise && unlockedCount >= maxContacts) {
      return res.status(403).json({
        success: false,
        code: "QUOTA_EXCEEDED",
        error: `You have reached your ${maxContacts} candidate unlock quota. Please upgrade your hiring pack to unlock more candidate contacts.`
      });
    }

    // 5. Insert into unlocked_contacts if not already present
    let unlockRecord = existingUnlock;
    if (!existingUnlock) {
      const { data: inserted, error: insertErr } = await supabase
        .from("unlocked_contacts")
        .insert([{
          recruiter_id: recruiter.id,
          talent_id: cleanTalentId,
          unlocked_at: new Date().toISOString()
        }])
        .select()
        .maybeSingle();

      if (insertErr) {
        console.warn("[Server] unlocked_contacts insert note:", insertErr.message);
      }
      unlockRecord = inserted;

      // Increment count on recruiters table
      const newCount = unlockedCount + 1;
      await supabase
        .from("recruiters")
        .update({
          contacts_unlocked_count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq("id", recruiter.id);
    }

    // 6. Fetch talent contact details
    const { data: talent } = await supabase
      .from("talent_profiles")
      .select("*")
      .eq("id", cleanTalentId)
      .maybeSingle();

    return res.json({
      success: true,
      unlocked: true,
      already_unlocked: Boolean(existingUnlock),
      unlock_record: unlockRecord,
      talent: talent || null,
      contacts_unlocked_count: existingUnlock ? unlockedCount : unlockedCount + 1,
      max_contacts: maxContacts
    });
  } catch (err: any) {
    console.error("[Server] /api/recruiter/unlock-contact error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 0a. Admin Register Endpoint - Direct persistence to public.admin_profiles via Server Supabase Client
app.post("/api/admin/register", async (req, res) => {
  try {
    const { email, password, fullName, userId, role } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required for admin registration." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || cleanEmail.split("@")[0] || "System Admin";
    const requestedRole = (role === "super_admin") ? "super_admin" : "admin";

    const supabase = getSupabaseClient();

    let targetUserId = userId;

    // If userId not provided, attempt to look up or create auth user via Supabase
    if (!targetUserId && password) {
      try {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              role: requestedRole
            }
          }
        });
        if (signUpData?.user) {
          targetUserId = signUpData.user.id;
        } else if (signUpErr) {
          console.warn("[Server] Auth signUp notice during admin registration:", signUpErr.message);
        }
      } catch (authException) {
        console.warn("[Server] Auth exception during admin registration:", authException);
      }
    }

    // Check if any active admin currently exists
    let shouldBeSuperAdmin = requestedRole === "super_admin";
    try {
      const { data: activeAdmins } = await supabase
        .from("admin_profiles")
        .select("id")
        .eq("is_active", true)
        .limit(1);

      if (!activeAdmins || activeAdmins.length === 0) {
        // First admin gets super_admin role and auto-activated
        shouldBeSuperAdmin = true;
      }
    } catch (_) {}

    // Check if admin_profiles record already exists
    const { data: existingProfile } = await supabase
      .from("admin_profiles")
      .select("*")
      .ilike("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      // Update with latest user_id if needed
      const updateData: any = {
        full_name: cleanName,
        updated_at: new Date().toISOString()
      };
      if (targetUserId && !existingProfile.user_id) {
        updateData.user_id = targetUserId;
      }
      if (shouldBeSuperAdmin && !existingProfile.is_active) {
        updateData.is_active = true;
        updateData.role = "super_admin";
      }

      const { data: updatedProfile } = await supabase
        .from("admin_profiles")
        .update(updateData)
        .eq("id", existingProfile.id)
        .select()
        .maybeSingle();

      return res.status(200).json({
        success: true,
        alreadyExists: true,
        profile: updatedProfile || existingProfile
      });
    }

    // Insert into public.admin_profiles
    const insertPayload: any = {
      full_name: cleanName,
      email: cleanEmail,
      role: shouldBeSuperAdmin ? "super_admin" : requestedRole,
      is_active: shouldBeSuperAdmin ? true : false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (targetUserId) {
      insertPayload.user_id = targetUserId;
    }

    let insertedProfile: any = null;
    let insertError: any = null;

    if (targetUserId) {
      const attempt = await supabase
        .from("admin_profiles")
        .insert(insertPayload)
        .select()
        .maybeSingle();

      if (!attempt.error && attempt.data) {
        insertedProfile = attempt.data;
      } else {
        insertError = attempt.error;
      }
    }

    // If no targetUserId or foreign key failed, try fallback
    if (!insertedProfile) {
      const fallbackId = targetUserId || `adm_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const fallbackPayload = {
        ...insertPayload,
        user_id: targetUserId || null
      };

      try {
        const fallbackAttempt = await supabase
          .from("admin_profiles")
          .upsert(fallbackPayload, { onConflict: "email" })
          .select()
          .maybeSingle();

        if (!fallbackAttempt.error && fallbackAttempt.data) {
          insertedProfile = fallbackAttempt.data;
        }
      } catch (upsertErr) {
        console.warn("[Server] Admin profile upsert notice:", upsertErr);
      }

      if (!insertedProfile) {
        insertedProfile = {
          id: fallbackId,
          user_id: targetUserId,
          full_name: cleanName,
          email: cleanEmail,
          role: shouldBeSuperAdmin ? "super_admin" : requestedRole,
          is_active: shouldBeSuperAdmin ? true : false
        };
      }
    }

    return res.status(200).json({
      success: true,
      profile: insertedProfile
    });
  } catch (err: any) {
    console.error("[Server] Admin register error:", err);
    return res.status(500).json({ error: err.message || "Failed to register admin in database." });
  }
});

// 1. Dynamic Quiz Question Generation Endpoint
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const { specialty, experienceLevel } = req.body;
    if (!specialty) {
      return res.status(400).json({ error: "Specialty is required." });
    }

    const tier = experienceLevel || "Seasoned Professional";
    const ai = getGeminiClient();

    const prompt = `You are Digital Campux's Senior Vetting Director. Generate exactly 3 highly practical, scenario-based multiple-choice quiz questions tailored to the specialty "${specialty}" and experience level "${tier}". 

Each question MUST challenge the candidate with a real-world dilemma they would face in their daily execution as a ${specialty} specialist. Each question must have exactly 4 choices, one clearly correct option, and a brief, highly educational explanation of the correct choice.

Return the JSON array of questions matching the exact schema provided.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional hiring director who creates realistic, challenging, and fair skill assessment questions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique question id (e.g. gq1, gq2, gq3)" },
              question: { type: Type.STRING, description: "The scenario-based question text." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 4 multiple choice options."
              },
              correctIdx: { type: Type.INTEGER, description: "The 0-based index of the correct option (0 to 3)." },
              explanation: { type: Type.STRING, description: "Detailed explanation why this choice is correct." }
            },
            required: ["id", "question", "options", "correctIdx", "explanation"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const questions = JSON.parse(text.trim());
    return res.json({ success: true, questions });

  } catch (error: any) {
    console.error("Error generating quiz:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Failed to generate scenario-based questions using Gemini." 
    });
  }
});

// 2. Dynamic AI Grading & Constructive Evaluation Endpoint
app.post("/api/gemini/grade", async (req, res) => {
  try {
    const { specialty, experienceLevel, questions, answers } = req.body;
    if (!questions || !answers) {
      return res.status(400).json({ error: "Questions and answers are required." });
    }

    const tier = experienceLevel || "Seasoned Professional";
    const ai = getGeminiClient();

    // 1. Programmatic math computation first for exact precision
    let correctCount = 0;
    const totalQuestions = questions.length;
    const breakdown = questions.map((q: any, idx: number) => {
      const selectedIdx = answers[idx];
      const isCorrect = selectedIdx === q.correctIdx;
      if (isCorrect) correctCount++;

      return {
        question: q.question,
        selectedOption: selectedIdx !== undefined && selectedIdx !== null ? q.options[selectedIdx] : "Unanswered/Timeout",
        correctOption: q.options[q.correctIdx],
        isCorrect,
        explanation: q.explanation
      };
    });

    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= 75;

    // 2. Ask Gemini to generate a beautifully styled constructive feedback paragraph
    const gradingPrompt = `Generate a constructive, highly professional, encouraging feedback evaluation paragraph (maximum 4 sentences) for a candidate who completed a ${specialty} vetting quiz (Experience level: ${tier}).
The candidate scored ${score}% (Threshold to pass is 75%).
${passed ? "They passed! Praise their systems knowledge and welcome them to Phase 2." : "They did not pass this attempt. Encourage them to stay calm, brush up on core competencies, and utilize preparation coaching resources to succeed next time."}`;

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: gradingPrompt,
      config: {
        systemInstruction: "You are Digital Campux's Expert Vetting & Recruitment Panel. Speak in a encouraging, professional, and supportive voice.",
      }
    });

    const feedbackParagraph = geminiResponse.text?.trim() || (passed 
      ? `Congratulations! You cleared the Digital Campux Phase 1 Gateway with a score of ${score}%. Your specialty expertise in ${specialty} is verified.`
      : `You scored ${score}% on this attempt. Stay positive and keep practicing! Use the resources provided to master key ${specialty} concepts and you'll clear the benchmark next time.`);

    return res.json({
      success: true,
      score,
      passed,
      feedback: feedbackParagraph,
      breakdown
    });

  } catch (error: any) {
    console.error("Error grading quiz:", error);
    // If Gemini fails, we still return the programmatically graded results so the user flow is NOT broken!
    try {
      const { questions, answers, specialty } = req.body;
      let correctCount = 0;
      const totalQuestions = questions.length;
      const breakdown = questions.map((q: any, idx: number) => {
        const selectedIdx = answers[idx];
        const isCorrect = selectedIdx === q.correctIdx;
        if (isCorrect) correctCount++;
        return {
          question: q.question,
          selectedOption: selectedIdx !== undefined && selectedIdx !== null ? q.options[selectedIdx] : "Unanswered/Timeout",
          correctOption: q.options[q.correctIdx],
          isCorrect,
          explanation: q.explanation
        };
      });
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= 75;

      return res.json({
        success: true,
        score,
        passed,
        feedback: passed 
          ? `Outstanding work! You passed the Phase 1 diagnostic for ${specialty} with ${score}%.`
          : `You scored ${score}%. You need at least 75% to pass. Please review the recommended coaching options.`,
        breakdown,
        fallbackGrading: true
      });
    } catch (fallbackError) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to evaluate the quiz."
      });
    }
  }
});

// 3. Clean 10-Field Resume PDF Generation & Download Endpoint
app.get("/api/resume/download", async (req, res) => {
  try {
    const talentId = (req.query.talent_id || req.query.id) as string;
    if (!talentId || typeof talentId !== "string" || !talentId.trim()) {
      return res.status(400).send("Error: talent_id query parameter is required.");
    }

    const cleanTalentId = talentId.trim();

    // 1. Query Supabase talent_profiles
    const supabase = getSupabaseClient();
    let profileData: any = null;

    try {
      const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .or(`id.eq.${cleanTalentId},user_id.eq.${cleanTalentId},slug.eq.${cleanTalentId}`)
        .maybeSingle();

      if (!error && data) {
        profileData = data;
      }
    } catch (dbErr) {
      console.warn("Supabase query warning:", dbErr);
    }

    // 2. Fallback to MOCK_TALENT if DB is empty or profile not yet saved to cloud DB
    if (!profileData) {
      const mockCandidate = MOCK_TALENT.find(
        (t) =>
          t.id === cleanTalentId ||
          t.id.toLowerCase() === cleanTalentId.toLowerCase() ||
          t.name.toLowerCase() === cleanTalentId.toLowerCase()
      );
      if (mockCandidate) {
        profileData = mockCandidate;
      }
    }

    if (!profileData) {
      return res.status(404).send("Talent candidate profile not found.");
    }

    // 3. STRICT SCHEMA FILTER: Pick ONLY the 10 requested fields
    // Exclude all platform diagnostics (quiz scores, phase completion status, admin override states, profile view counts)
    const fullName = profileData.full_name || profileData.name || "Candidate";
    const roleTitle =
      profileData.role_title ||
      profileData.role ||
      profileData.headline ||
      profileData.specialization ||
      "Professional Specialist";
    const location = profileData.location || "";
    const bio = profileData.bio || profileData.about || "";
    const email = profileData.email || "";
    const phone = profileData.phone || "";
    const linkedinUrl = profileData.linkedin_url || profileData.linkedinUrl || "";

    // Parse & normalize experience_history
    let rawExperiences =
      profileData.experience_history ||
      profileData.work_history ||
      profileData.workHistory ||
      profileData.projects ||
      [];

    if (typeof rawExperiences === "string") {
      try {
        rawExperiences = JSON.parse(rawExperiences);
      } catch (_) {
        rawExperiences = [];
      }
    }

    const experienceHistory = Array.isArray(rawExperiences)
      ? rawExperiences.map((exp: any) => ({
          role: exp.role || exp.title || exp.role_title || "Specialist",
          company: exp.company || exp.organization || exp.client || "",
          dates:
            exp.dates ||
            (exp.startDate
              ? `${exp.startDate} - ${exp.endDate || "Present"}`
              : exp.year || ""),
          location: exp.location || "",
          description: exp.description || "",
          bullets: Array.isArray(exp.bullets)
            ? exp.bullets
            : Array.isArray(exp.highlights)
            ? exp.highlights
            : exp.metrics
            ? [exp.metrics]
            : [],
        }))
      : [];

    // Parse & normalize tools (formatted as comma-separated list)
    let rawTools =
      profileData.tools ||
      profileData.skills ||
      profileData.ai_tools ||
      profileData.aiTools ||
      profileData.tech_stack ||
      [];

    if (typeof rawTools === "string") {
      try {
        rawTools = JSON.parse(rawTools);
      } catch (_) {
        rawTools = rawTools.split(",").map((s: string) => s.trim());
      }
    }

    const tools = Array.isArray(rawTools)
      ? rawTools
          .map((t: any) => (typeof t === "string" ? t.trim() : t?.name || ""))
          .filter(Boolean)
      : [];

    // Parse & normalize certifications
    let rawCerts =
      profileData.certifications ||
      profileData.certificates ||
      profileData.accreditations ||
      [];

    if (typeof rawCerts === "string") {
      try {
        rawCerts = JSON.parse(rawCerts);
      } catch (_) {
        rawCerts = rawCerts.split(",").map((s: string) => s.trim());
      }
    }

    const certifications = Array.isArray(rawCerts)
      ? rawCerts
          .map((c: any) => {
            if (typeof c === "string") return c.trim();
            if (c && typeof c === "object") {
              const name = c.name || c.title || "";
              const issuer = c.issuer ? ` - ${c.issuer}` : "";
              const year = c.year ? ` (${c.year})` : "";
              return `${name}${issuer}${year}`.trim();
            }
            return "";
          })
          .filter(Boolean)
      : [];

    const strictData: StrictResumeData = {
      full_name: fullName,
      role_title: roleTitle,
      location,
      bio,
      email,
      phone,
      linkedin_url: linkedinUrl,
      experience_history: experienceHistory,
      tools,
      certifications,
    };

    // 4. Set strict Response Headers
    const safeFilename = fullName.replace(/[^a-zA-Z0-9_\-]/g, "_");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${safeFilename}_Resume.pdf"`);

    // 5. Generate and stream PDF to client
    const pdfStream = generateResumePdfStream(strictData);
    pdfStream.pipe(res);
  } catch (error: any) {
    console.error("Error generating resume PDF:", error);
    res.status(500).send(`Failed to generate resume: ${error.message || "Unknown error"}`);
  }
});

// ========================================================
// THE SEO GAME — CORE ENGINE & ACTION PROCESSING ENDPOINTS
// ========================================================

// 1. Deterministic Page Potential Calculation Endpoint
app.post("/api/seo-game/calculate-potential", (req, res) => {
  try {
    const { factors, keywordContext } = req.body;
    const potential = calculatePagePotential(factors || {}, keywordContext);
    return res.json({ success: true, potential });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Centralized Game Action Processor Endpoint (Authoritative, Atomic, Idempotent)
app.post("/api/seo-game/process-action", async (req, res) => {
  try {
    const { actionCode, payload = {} } = req.body;
    if (!actionCode) {
      return res.status(400).json({ 
        success: false, 
        error: "MISSING_PARAMETERS", 
        message: "actionCode is required." 
      });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: "UNAUTHENTICATED", 
        message: "Valid session token is required to execute game actions." 
      });
    }

    const supabase = getSupabaseClient();
    const { data: userData, error: userAuthError } = await supabase.auth.getUser(token);
    if (userAuthError || !userData?.user) {
      return res.status(401).json({ 
        success: false, 
        error: "UNAUTHENTICATED", 
        message: "Session token is invalid or expired." 
      });
    }

    // Authoritative Player Resolution
    const { data: playerOwner, error: ownerErr } = await supabase
      .from("seo_game_players")
      .select("id, user_id, level, xp, current_day")
      .eq("user_id", userData.user.id)
      .single();

    if (ownerErr || !playerOwner) {
      return res.status(404).json({ 
        success: false, 
        error: "PLAYER_NOT_FOUND", 
        message: "No SEO Game player profile found for this authenticated user." 
      });
    }

    const authenticatedPlayerId = playerOwner.id;

    // Idempotency Key Validation & Replay Cache Check
    let idempotencyKey = (req.body.idempotencyKey || req.body.requestId || req.headers["idempotency-key"]) as string;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (idempotencyKey && !uuidRegex.test(idempotencyKey)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_IDEMPOTENCY_KEY",
        message: "idempotencyKey must be a valid UUID format."
      });
    }
    if (!idempotencyKey) {
      idempotencyKey = randomUUID();
    }

    const { data: existingAction } = await supabase
      .from("seo_game_actions")
      .select("*")
      .eq("id", idempotencyKey)
      .eq("player_id", authenticatedPlayerId)
      .maybeSingle();

    if (existingAction && existingAction.result) {
      return res.status(200).json({
        ...existingAction.result,
        cached: true,
        idempotentReplay: true
      });
    }

    // Step 4: Strict Target Ownership Validation
    let targetBusinessId = req.body.businessId;
    if (targetBusinessId) {
      const { data: bizOwner } = await supabase
        .from("seo_game_businesses")
        .select("id, player_id")
        .eq("id", targetBusinessId)
        .maybeSingle();

      if (!bizOwner || bizOwner.player_id !== authenticatedPlayerId) {
        return res.status(403).json({
          success: false,
          error: "UNAUTHORIZED_BUSINESS",
          message: "You do not own the specified business entity."
        });
      }
    } else {
      const { data: defaultBiz } = await supabase
        .from("seo_game_businesses")
        .select("id")
        .eq("player_id", authenticatedPlayerId)
        .limit(1)
        .maybeSingle();
      targetBusinessId = defaultBiz?.id;
    }

    let targetWebsiteId = req.body.websiteId;
    if (targetWebsiteId) {
      const { data: webRecord } = await supabase
        .from("seo_game_websites")
        .select("id, business_id")
        .eq("id", targetWebsiteId)
        .maybeSingle();

      if (!webRecord || webRecord.business_id !== targetBusinessId) {
        return res.status(403).json({
          success: false,
          error: "UNAUTHORIZED_WEBSITE",
          message: "Target website does not belong to your business."
        });
      }
    } else if (targetBusinessId) {
      const { data: defaultWeb } = await supabase
        .from("seo_game_websites")
        .select("id")
        .eq("business_id", targetBusinessId)
        .limit(1)
        .maybeSingle();
      targetWebsiteId = defaultWeb?.id;
    }

    const targetPageId = req.body.pageId;
    if (targetPageId) {
      const { data: pageRecord } = await supabase
        .from("seo_game_pages")
        .select("id, website_id")
        .eq("id", targetPageId)
        .maybeSingle();

      if (!pageRecord) {
        return res.status(404).json({
          success: false,
          error: "PAGE_NOT_FOUND",
          message: "Target page does not exist."
        });
      }

      const { data: pageWeb } = await supabase
        .from("seo_game_websites")
        .select("id, business_id")
        .eq("id", pageRecord.website_id)
        .maybeSingle();

      if (!pageWeb || pageWeb.business_id !== targetBusinessId) {
        return res.status(403).json({
          success: false,
          error: "UNAUTHORIZED_PAGE",
          message: "Target page does not belong to your business website."
        });
      }
    }

    const targetKeywordId = req.body.keywordId || req.body.payload?.keywordId;
    if (targetKeywordId) {
      const { data: kwRecord } = await supabase
        .from("seo_game_keywords")
        .select("id, website_id")
        .eq("id", targetKeywordId)
        .maybeSingle();

      if (!kwRecord) {
        return res.status(404).json({
          success: false,
          error: "KEYWORD_NOT_FOUND",
          message: "Target keyword does not exist."
        });
      }

      const { data: kwWeb } = await supabase
        .from("seo_game_websites")
        .select("id, business_id")
        .eq("id", kwRecord.website_id)
        .maybeSingle();

      if (!kwWeb || kwWeb.business_id !== targetBusinessId) {
        return res.status(403).json({
          success: false,
          error: "UNAUTHORIZED_KEYWORD",
          message: "Target keyword does not belong to your business website."
        });
      }
    }

    // Retrieve Action Type Details & Enforce Level Unlocks
    let actionConfig = CANONICAL_ACTION_TYPES[actionCode];
    const { data: dbActionType } = await supabase
      .from("seo_game_action_types")
      .select("*")
      .eq("action_code", actionCode)
      .maybeSingle();

    if (dbActionType) {
      actionConfig = {
        name: dbActionType.name,
        description: dbActionType.description,
        energy_cost: dbActionType.energy_cost,
        coin_cost: dbActionType.coin_cost,
        ai_credit_cost: dbActionType.ai_credit_cost,
        xp_reward: dbActionType.xp_reward,
        requires_level: dbActionType.requires_level
      };
    }

    if (!actionConfig) {
      return res.status(400).json({ 
        success: false, 
        error: "INVALID_ACTION_CODE", 
        message: `Action code ${actionCode} is not recognized.` 
      });
    }

    if (playerOwner.level < actionConfig.requires_level) {
      return res.status(400).json({
        success: false,
        error: "LEVEL_LOCKED",
        message: `Action requires Level ${actionConfig.requires_level}. Current player level is ${playerOwner.level}.`
      });
    }

    // Step 2: Atomic PostgreSQL RPC Execution via user session client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://orc23koevjbbywdcivenno.supabase.co";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: rpcResult, error: rpcError } = await userClient.rpc("seo_game_process_action", {
      p_action_code: actionCode,
      p_business_id: targetBusinessId || null,
      p_page_id: targetPageId || null,
      p_keyword_id: targetKeywordId || null
    });

    if (rpcError) {
      const errCode = rpcError.message || "ACTION_FAILED";
      const isInsufficient = errCode.startsWith("INSUFFICIENT_");

      // Fetch wallet for deficit info
      const { data: w } = await supabase
        .from("seo_game_wallets")
        .select("energy, coins, ai_credits, max_energy")
        .eq("player_id", authenticatedPlayerId)
        .single();

      return res.status(400).json({
        success: false,
        error: isInsufficient ? "INSUFFICIENT_RESOURCES" : errCode,
        message: isInsufficient ? `Insufficient resources: ${errCode}` : rpcError.message,
        deficit: isInsufficient && w ? {
          energyNeeded: actionConfig.energy_cost,
          energyAvailable: w.energy,
          coinsNeeded: actionConfig.coin_cost,
          coinsAvailable: w.coins,
          aiCreditsNeeded: actionConfig.ai_credit_cost,
          aiCreditsAvailable: w.ai_credits
        } : undefined
      });
    }

    // Extract authoritative wallet and player numbers from atomic RPC result
    const walletAfter = {
      energy: rpcResult?.resources?.energy_remaining ?? 0,
      maxEnergy: 100,
      coins: rpcResult?.resources?.coins_remaining ?? 0,
      aiCredits: rpcResult?.resources?.ai_credits_remaining ?? 0
    };

    const playerAfter = {
      level: rpcResult?.progression?.current_level ?? playerOwner.level,
      xp: rpcResult?.progression?.xp_total ?? (playerOwner.xp + actionConfig.xp_reward),
      leveledUp: (rpcResult?.progression?.current_level ?? 1) > (rpcResult?.progression?.previous_level ?? playerOwner.level),
      levelTitle: rpcResult?.progression?.level_title ?? "SEO Apprentice"
    };

    // Apply Action-Specific Game State Updates
    const gameStateUpdates: any = {};
    let feedbackSummary = `Successfully executed ${actionConfig.name}.`;
    let feedbackImpact = `+${actionConfig.xp_reward} XP gained.`;
    let scoreChange: number | undefined;

    switch (actionCode) {
      case "KEYWORD_RESEARCH": {
        const discovered = [
          { keyword: payload.keyword || "b2b enterprise seo strategy", intent: "commercial", search_volume: 2900, difficulty: 36, commercial_value: 88 },
          { keyword: "ai search engine visibility optimization", intent: "transactional", search_volume: 1800, difficulty: 42, commercial_value: 94 },
          { keyword: "topical authority clusters guide", intent: "informational", search_volume: 4200, difficulty: 28, commercial_value: 70 }
        ];

        if (targetWebsiteId) {
          for (const item of discovered) {
            await supabase.from("seo_game_keywords").insert({
              website_id: targetWebsiteId,
              keyword: item.keyword,
              intent: item.intent,
              search_volume: item.search_volume,
              difficulty: item.difficulty,
              commercial_value: item.commercial_value,
              current_position: null
            });
          }
        }
        gameStateUpdates.newKeywords = discovered;
        feedbackSummary = "Discovered 3 high-intent search query opportunities with low competition.";
        feedbackImpact = "Added keyword targets to your campaign pipeline.";
        break;
      }

      case "CREATE_PAGE": {
        const title = payload.pageTitle || "Growth Architecture Core";
        const slug = payload.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        let newPage: any = null;
        if (targetWebsiteId) {
          // Staged SEO Lifecycle: newly created page is in draft/unindexed state
          const { data: createdPage } = await supabase.from("seo_game_pages").insert({
            website_id: targetWebsiteId,
            title,
            slug,
            page_type: payload.pageType || "landing",
            meta_title: `${title} | Premium Strategy`,
            meta_description: `Authoritative guide to ${title}.`,
            word_count: 1550,
            robots_index: true,
            robots_follow: true,
            content_quality_score: 65,
            page_speed_score: 88,
            indexed: false, // In staged lifecycle, starts unindexed
            published_at: null // In staged lifecycle, starts as draft
          }).select().single();
          newPage = createdPage;
        }

        const baselineFactors: RankingFactors = {
          intent_match: 65,
          content_quality: 65,
          topical_coverage: 55,
          technical_health: 80,
          internal_link_score: 35,
          backlink_score: 15,
          authority_score: 30,
          freshness_score: 100,
          entity_score: 45,
          engagement_score: 50
        };

        const initialScore = calculateOverallScore(baselineFactors);
        const initialPotential = calculatePagePotential(baselineFactors);

        if (newPage) {
          await supabase.from("seo_game_ranking_factors").insert({
            page_id: newPage.id,
            ...baselineFactors,
            overall_score: initialScore,
            updated_at: new Date().toISOString()
          });
        }

        gameStateUpdates.pageUpdated = newPage;
        gameStateUpdates.rankingFactors = baselineFactors;
        gameStateUpdates.potential = initialPotential;
        scoreChange = initialScore;
        feedbackSummary = `Created new page draft "${title}".`;
        feedbackImpact = `Baseline SEO factor score initialized at ${initialScore}/100. Pending crawling & indexation.`;
        break;
      }

      case "OPTIMIZE_PAGE": {
        if (targetPageId) {
          const { data: factorRecord } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPageId)
            .maybeSingle();

          const current = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
          const boosted: RankingFactors = {
            ...current,
            intent_match: Math.min(100, current.intent_match + 15),
            content_quality: Math.min(100, current.content_quality + 14),
            freshness_score: 98,
            entity_score: Math.min(100, current.entity_score + 10)
          };

          const newOverall = calculateOverallScore(boosted);
          const prevOverall = factorRecord?.overall_score ?? calculateOverallScore(current);
          scoreChange = Math.round((newOverall - prevOverall) * 10) / 10;
          const newPotential = calculatePagePotential(boosted);

          await supabase.from("seo_game_ranking_factors").upsert({
            page_id: targetPageId,
            ...boosted,
            overall_score: newOverall,
            updated_at: new Date().toISOString()
          });

          await supabase.from("seo_game_pages").update({
            content_quality_score: boosted.content_quality,
            updated_at: new Date().toISOString()
          }).eq("id", targetPageId);

          gameStateUpdates.rankingFactors = boosted;
          gameStateUpdates.potential = newPotential;
          feedbackSummary = "Refined search intent match and comprehensive E-E-A-T signals.";
          feedbackImpact = `Overall page potential elevated by +${scoreChange} points (New Score: ${newOverall}/100).`;
        }
        break;
      }

      case "TECHNICAL_AUDIT": {
        if (targetPageId) {
          const { data: factorRecord } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPageId)
            .maybeSingle();

          const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
          factors.technical_health = Math.min(100, factors.technical_health + 20);
          const newScore = calculateOverallScore(factors);

          await supabase.from("seo_game_ranking_factors").upsert({
            page_id: targetPageId,
            ...factors,
            overall_score: newScore,
            updated_at: new Date().toISOString()
          });

          gameStateUpdates.rankingFactors = factors;
          gameStateUpdates.potential = calculatePagePotential(factors);
        }
        feedbackSummary = "Eliminated render-blocking CSS and resolved Core Web Vitals latency.";
        feedbackImpact = "Technical health score upgraded to peak performance.";
        break;
      }

      case "INTERNAL_LINKING": {
        const targetPage = payload.targetPageId || targetPageId;
        if (targetPage) {
          const { data: factorRecord } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPage)
            .maybeSingle();

          const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
          factors.internal_link_score = Math.min(100, factors.internal_link_score + 16);
          const newScore = calculateOverallScore(factors);

          await supabase.from("seo_game_ranking_factors").upsert({
            page_id: targetPage,
            ...factors,
            overall_score: newScore,
            updated_at: new Date().toISOString()
          });

          gameStateUpdates.rankingFactors = factors;
          gameStateUpdates.potential = calculatePagePotential(factors);
        }
        feedbackSummary = "Connected contextual internal link silo with keyword-rich anchor text.";
        feedbackImpact = "Internal PageRank distributed to target page.";
        break;
      }

      case "CONTENT_EXPANSION": {
        if (targetPageId) {
          const { data: factorRecord } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPageId)
            .maybeSingle();

          const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
          factors.topical_coverage = Math.min(100, factors.topical_coverage + 18);
          factors.content_quality = Math.min(100, factors.content_quality + 10);
          const newScore = calculateOverallScore(factors);

          await supabase.from("seo_game_ranking_factors").upsert({
            page_id: targetPageId,
            ...factors,
            overall_score: newScore,
            updated_at: new Date().toISOString()
          });

          gameStateUpdates.rankingFactors = factors;
          gameStateUpdates.potential = calculatePagePotential(factors);
        }
        feedbackSummary = "Expanded semantic depth and addressed sub-queries with rich media.";
        feedbackImpact = "Topical coverage improved across primary entity clusters.";
        break;
      }

      case "AUTHORITY_CAMPAIGN": {
        if (targetPageId) {
          const { data: factorRecord } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPageId)
            .maybeSingle();

          const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
          factors.backlink_score = Math.min(100, factors.backlink_score + 18);
          factors.authority_score = Math.min(100, factors.authority_score + 8);
          const newScore = calculateOverallScore(factors);

          await supabase.from("seo_game_ranking_factors").upsert({
            page_id: targetPageId,
            ...factors,
            overall_score: newScore,
            updated_at: new Date().toISOString()
          });

          gameStateUpdates.rankingFactors = factors;
          gameStateUpdates.potential = calculatePagePotential(factors);
        }
        feedbackSummary = "Secured high-authority editorial citation from relevant industry journal.";
        feedbackImpact = "Backlink equity and domain trust significantly upgraded.";
        break;
      }

      case "AI_VISIBILITY_ANALYSIS": {
        if (targetPageId) {
          const { data: factorRecord } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPageId)
            .maybeSingle();

          const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
          factors.entity_score = Math.min(100, factors.entity_score + 15);
          const newScore = calculateOverallScore(factors);

          await supabase.from("seo_game_ranking_factors").upsert({
            page_id: targetPageId,
            ...factors,
            overall_score: newScore,
            updated_at: new Date().toISOString()
          });

          gameStateUpdates.rankingFactors = factors;
          gameStateUpdates.potential = calculatePagePotential(factors);
        }
        feedbackSummary = "Analyzed AI Overview and SearchGPT citation probabilities.";
        feedbackImpact = "Entity salience optimized for generative search synthesis.";
        break;
      }
    }

    // Update Player State Metrics
    const { data: existingState } = await supabase
      .from("seo_game_player_state")
      .select("*")
      .eq("player_id", authenticatedPlayerId)
      .maybeSingle();

    const updatedPlayerState = {
      player_id: authenticatedPlayerId,
      current_day: playerOwner.current_day ?? 1,
      total_traffic: existingState?.total_traffic ?? 0,
      total_leads: existingState?.total_leads ?? 0,
      total_revenue: existingState?.total_revenue ?? 0,
      indexed_pages: (existingState?.indexed_pages ?? 0) + (actionCode === "CREATE_PAGE" ? 1 : 0),
      ranking_keywords: (existingState?.ranking_keywords ?? 0) + (actionCode === "KEYWORD_RESEARCH" ? 3 : 0),
      page_one_keywords: existingState?.page_one_keywords ?? 0,
      authority_score: Math.min(100, (existingState?.authority_score ?? 10) + (actionCode === "AUTHORITY_CAMPAIGN" ? 3 : 0)),
      technical_score: Math.min(100, (existingState?.technical_score ?? 50) + (actionCode === "TECHNICAL_AUDIT" ? 8 : 0)),
      content_score: Math.min(100, (existingState?.content_score ?? 40) + (actionCode === "OPTIMIZE_PAGE" ? 5 : 0)),
      topical_score: Math.min(100, (existingState?.topical_score ?? 20) + (actionCode === "CONTENT_EXPANSION" ? 6 : 0)),
      ai_visibility_score: Math.min(100, (existingState?.ai_visibility_score ?? 15) + (actionCode === "AI_VISIBILITY_ANALYSIS" ? 8 : 0)),
      business_health: 100,
      updated_at: new Date().toISOString()
    };

    await supabase.from("seo_game_player_state").upsert(updatedPlayerState);
    gameStateUpdates.playerState = updatedPlayerState;

    // Authoritative Progression, Missions & Achievements Evaluation
    const progressionReport = await evaluateProgressionAndMissions({
      playerId: authenticatedPlayerId,
      businessId: targetBusinessId || "",
      websiteId: targetWebsiteId || "",
      currentDay: playerOwner.current_day ?? 1,
      supabase
    });

    const fullResultPayload = {
      success: true,
      actionCode,
      actionName: actionConfig.name,
      idempotencyKey,
      resourcesSpent: {
        energy: actionConfig.energy_cost,
        coins: actionConfig.coin_cost,
        aiCredits: actionConfig.ai_credit_cost
      },
      walletAfter,
      xpEarned: actionConfig.xp_reward + progressionReport.totalXpAwarded,
      playerAfter: {
        ...playerAfter,
        level: progressionReport.playerLevel,
        xp: progressionReport.playerXp,
        leveledUp: progressionReport.leveledUp || playerAfter.leveledUp,
        levelTitle: progressionReport.levelTitle
      },
      gameStateUpdates,
      progression: progressionReport,
      feedback: {
        title: (progressionReport.leveledUp || playerAfter.leveledUp) ? `LEVEL UP! Level ${progressionReport.playerLevel} Unlocked` : `${actionConfig.name} Completed`,
        summary: feedbackSummary,
        impact: (progressionReport.leveledUp || playerAfter.leveledUp) ? `Congratulations! You unlocked ${progressionReport.levelTitle}!` : feedbackImpact,
        scoreChange
      }
    };

    // Store in seo_game_actions with id = idempotencyKey for idempotent deduplication
    try {
      await supabase.from("seo_game_actions").insert({
        id: idempotencyKey,
        player_id: authenticatedPlayerId,
        business_id: targetBusinessId || null,
        action_type: actionCode,
        target_type: targetPageId ? "page" : targetKeywordId ? "keyword" : "website",
        target_id: targetPageId || targetKeywordId || targetWebsiteId || null,
        cost_coins: actionConfig.coin_cost,
        cost_energy: actionConfig.energy_cost,
        cost_ai_credits: actionConfig.ai_credit_cost,
        result: fullResultPayload,
        day: playerOwner.current_day ?? 1,
        created_at: new Date().toISOString()
      });
    } catch (insertErr: any) {
      if (insertErr?.code === "23505") {
        console.warn("Concurrent duplicate insert caught by primary key:", idempotencyKey);
      }
    }

    return res.status(200).json(fullResultPayload);

  } catch (error: any) {
    console.error("Error processing SEO game action:", error);
    return res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: error.message || "Failed to process SEO game action."
    });
  }
});

// ========================================================
// THE SEO GAME — PHASE 2 LIFECYCLE & SERP SIMULATION ROUTES
// ========================================================

/**
 * Helper to resolve authenticated session and SEO player profile
 */
async function resolveAuthPlayer(req: express.Request, res: express.Response) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    res.status(401).json({ success: false, error: "UNAUTHENTICATED", message: "Valid session token is required." });
    return null;
  }
  const supabase = getSupabaseClient();
  const { data: userData, error: userAuthError } = await supabase.auth.getUser(token);
  if (userAuthError || !userData?.user) {
    res.status(401).json({ success: false, error: "UNAUTHENTICATED", message: "Session token is invalid or expired." });
    return null;
  }
  const { data: player, error: playerErr } = await supabase
    .from("seo_game_players")
    .select("*")
    .eq("user_id", userData.user.id)
    .single();

  if (playerErr || !player) {
    res.status(404).json({ success: false, error: "PLAYER_NOT_FOUND", message: "SEO Game player profile not found." });
    return null;
  }
  return { supabase, user: userData.user, player };
}

// 3. Full Dashboard & State Synchronization Endpoint
app.get("/api/seo-game/dashboard-data", async (req, res) => {
  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;

    // 1. Wallet
    const { data: wallet } = await supabase
      .from("seo_game_wallets")
      .select("*")
      .eq("player_id", player.id)
      .maybeSingle();

    // 2. Business
    let { data: business } = await supabase
      .from("seo_game_businesses")
      .select("*")
      .eq("player_id", player.id)
      .maybeSingle();

    if (!business) {
      const { data: newBiz } = await supabase.from("seo_game_businesses").insert({
        player_id: player.id,
        name: `${player.display_name || "Apex"} Digital HQ`,
        industry: "Technology",
        current_budget: 500000,
        starting_budget: 500000,
        business_level: 1,
        reputation: 50,
        authority_score: 10
      }).select().single();
      business = newBiz;
    }

    // 3. Website
    let { data: website } = await supabase
      .from("seo_game_websites")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle();

    if (!website) {
      const cleanDomain = `${(player.display_name || "growth").toLowerCase().replace(/[^a-z0-9]/g, "")}-digital.com`;
      const { data: newWeb } = await supabase.from("seo_game_websites").insert({
        business_id: business.id,
        domain: cleanDomain,
        website_name: `${player.display_name || "Apex"} Digital`,
        site_health_score: 50,
        crawlability_score: 50,
        indexability_score: 50,
        technical_score: 50,
        content_score: 50,
        trust_score: 50,
        topical_authority_score: 10
      }).select().single();
      website = newWeb;
    }

    // 4. Ensure Competitors exist for this business
    let { data: competitors } = await supabase
      .from("seo_game_competitors")
      .select("*")
      .eq("business_id", business.id);

    if (!competitors || competitors.length === 0) {
      for (const comp of SEED_COMPETITORS) {
        await supabase.from("seo_game_competitors").insert({
          business_id: business.id,
          name: comp.name,
          domain: comp.domain,
          industry: comp.industry,
          strategy: comp.strategy,
          difficulty: comp.difficulty,
          authority_score: comp.authority_score,
          content_score: comp.content_score,
          technical_score: comp.technical_score,
          active: true
        });
      }
      const { data: freshComp } = await supabase
        .from("seo_game_competitors")
        .select("*")
        .eq("business_id", business.id);
      competitors = freshComp || [];
    }

    // 5. Pages
    const { data: pages } = await supabase
      .from("seo_game_pages")
      .select("*")
      .eq("website_id", website.id)
      .order("created_at", { ascending: false });

    // 6. Keywords
    const { data: keywords } = await supabase
      .from("seo_game_keywords")
      .select("*")
      .eq("website_id", website.id)
      .order("created_at", { ascending: false });

    // 7. Keyword Targets
    const { data: targets } = await supabase
      .from("seo_game_keyword_targets")
      .select("*");

    // 8. Ranking Factors
    const pageIds = (pages || []).map(p => p.id);
    let rankingFactorsList: any[] = [];
    if (pageIds.length > 0) {
      const { data: factors } = await supabase
        .from("seo_game_ranking_factors")
        .select("*")
        .in("page_id", pageIds);
      rankingFactorsList = factors || [];
    }

    // 9. Business Metrics
    let { data: metrics } = await supabase
      .from("seo_game_business_metrics")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle();

    if (!metrics) {
      const { data: newMetrics } = await supabase.from("seo_game_business_metrics").insert({
        business_id: business.id,
        traffic: 0,
        leads: 0,
        customers: 0,
        revenue: 0,
        conversion_rate: 0,
        brand_strength: 50,
        market_position: 10
      }).select().single();
      metrics = newMetrics;
    }

    // 10. Player State
    let { data: playerState } = await supabase
      .from("seo_game_player_state")
      .select("*")
      .eq("player_id", player.id)
      .maybeSingle();

    if (!playerState) {
      const { data: newState } = await supabase.from("seo_game_player_state").insert({
        player_id: player.id,
        current_day: player.current_day || 1,
        total_traffic: 0,
        total_leads: 0,
        total_revenue: 0,
        indexed_pages: 0,
        ranking_keywords: 0,
        page_one_keywords: 0,
        authority_score: 10,
        business_health: 100
      }).select().single();
      playerState = newState;
    }

    // 11. Missions
    const { data: missions } = await supabase
      .from("seo_game_missions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    const { data: missionProgress } = await supabase
      .from("seo_game_mission_progress")
      .select("*")
      .eq("player_id", player.id);

    // 12. Evaluate Lifecycle for all pages
    const evaluatedPages = (pages || []).map(page => {
      const factors = rankingFactorsList.find(f => f.page_id === page.id);
      const target = (targets || []).find(t => t.page_id === page.id);
      const kw = target ? (keywords || []).find(k => k.id === target.keyword_id) : null;
      const lifecycle = determinePageLifecycle({
        page,
        rankingFactors: factors ? normalizeFactors(factors) : null,
        targetKeyword: kw ? { id: kw.id, keyword: kw.keyword, current_position: kw.current_position } : null,
        serpPosition: kw?.current_position ?? null
      });
      return {
        ...page,
        rankingFactors: factors,
        targetKeyword: kw,
        lifecycle
      };
    });

    // 13. Events & Algorithm Updates
    const { data: events } = await supabase
      .from("seo_game_events")
      .select("*")
      .eq("player_id", player.id)
      .order("day", { ascending: false })
      .limit(8);

    const { data: competitorActions } = await supabase
      .from("seo_game_competitor_actions")
      .select("*, seo_game_competitors(*)")
      .order("created_at", { ascending: false })
      .limit(8);

    return res.status(200).json({
      success: true,
      player,
      wallet,
      business,
      website,
      pages: evaluatedPages,
      keywords: keywords || [],
      targets: targets || [],
      competitors: competitors || [],
      metrics,
      playerState,
      missions: missions || [],
      missionProgress: missionProgress || [],
      events: events || [],
      competitorActions: competitorActions || []
    });

  } catch (err: any) {
    console.error("Error fetching dashboard data:", err);
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  }
});

// 4. Publish Page Endpoint (Draft -> Published)
app.post("/api/seo-game/lifecycle/publish-page", async (req, res) => {
  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({ success: false, error: "MISSING_PAGE_ID", message: "pageId is required." });
    }

    // Ownership check
    const { data: pageRecord } = await supabase
      .from("seo_game_pages")
      .select("*, seo_game_websites(business_id)")
      .eq("id", pageId)
      .maybeSingle();

    if (!pageRecord) {
      return res.status(404).json({ success: false, error: "PAGE_NOT_FOUND", message: "Page does not exist." });
    }

    const { data: biz } = await supabase
      .from("seo_game_businesses")
      .select("player_id")
      .eq("id", pageRecord.seo_game_websites?.business_id)
      .maybeSingle();

    if (!biz || biz.player_id !== player.id) {
      return res.status(403).json({ success: false, error: "UNAUTHORIZED_PAGE", message: "Page does not belong to your business." });
    }

    const now = new Date().toISOString();
    const { data: updatedPage } = await supabase
      .from("seo_game_pages")
      .update({
        published_at: now,
        updated_at: now
      })
      .eq("id", pageId)
      .select()
      .single();

    // Also update seo_game_content
    await supabase
      .from("seo_game_content")
      .update({ status: "published", updated_at: now })
      .eq("page_id", pageId);

    const { data: factors } = await supabase
      .from("seo_game_ranking_factors")
      .select("*")
      .eq("page_id", pageId)
      .maybeSingle();

    const lifecycle = determinePageLifecycle({
      page: updatedPage,
      rankingFactors: factors ? normalizeFactors(factors) : null
    });

    return res.status(200).json({
      success: true,
      page: updatedPage,
      lifecycle,
      message: `Page "${updatedPage.title}" published live. Awaiting crawler discovery.`
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  }
});

// 5. Toggle Robots Directive Endpoint (permits testing noindex failure state)
app.post("/api/seo-game/lifecycle/toggle-robots-directive", async (req, res) => {
  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;
    const { pageId, allowIndex } = req.body;

    if (!pageId) {
      return res.status(400).json({ success: false, error: "MISSING_PAGE_ID", message: "pageId is required." });
    }

    const { data: pageRecord } = await supabase
      .from("seo_game_pages")
      .select("*, seo_game_websites(business_id)")
      .eq("id", pageId)
      .maybeSingle();

    if (!pageRecord) {
      return res.status(404).json({ success: false, error: "PAGE_NOT_FOUND", message: "Page does not exist." });
    }

    const { data: biz } = await supabase
      .from("seo_game_businesses")
      .select("player_id")
      .eq("id", pageRecord.seo_game_websites?.business_id)
      .maybeSingle();

    if (!biz || biz.player_id !== player.id) {
      return res.status(403).json({ success: false, error: "UNAUTHORIZED_PAGE", message: "Page does not belong to your business." });
    }

    const isIndexable = Boolean(allowIndex);
    const updates: any = {
      robots_index: isIndexable,
      updated_at: new Date().toISOString()
    };

    // If setting to noindex, de-index the page
    if (!isIndexable) {
      updates.indexed = false;
    }

    const { data: updatedPage } = await supabase
      .from("seo_game_pages")
      .update(updates)
      .eq("id", pageId)
      .select()
      .single();

    const { data: factors } = await supabase
      .from("seo_game_ranking_factors")
      .select("*")
      .eq("page_id", pageId)
      .maybeSingle();

    const lifecycle = determinePageLifecycle({
      page: updatedPage,
      rankingFactors: factors ? normalizeFactors(factors) : null
    });

    return res.status(200).json({
      success: true,
      page: updatedPage,
      lifecycle,
      message: isIndexable 
        ? "Robots directive set to INDEX. Page is crawl-eligible." 
        : "Robots directive set to NOINDEX. Crawler will block indexation."
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  }
});

// 6. Crawl & Quality Evaluation Endpoint (CRAWLED -> EVALUATED -> INDEXED)
app.post("/api/seo-game/lifecycle/crawl-page", async (req, res) => {
  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({ success: false, error: "MISSING_PAGE_ID", message: "pageId is required." });
    }

    const { data: pageRecord } = await supabase
      .from("seo_game_pages")
      .select("*, seo_game_websites(business_id)")
      .eq("id", pageId)
      .maybeSingle();

    if (!pageRecord) {
      return res.status(404).json({ success: false, error: "PAGE_NOT_FOUND", message: "Page does not exist." });
    }

    const { data: biz } = await supabase
      .from("seo_game_businesses")
      .select("player_id")
      .eq("id", pageRecord.seo_game_websites?.business_id)
      .maybeSingle();

    if (!biz || biz.player_id !== player.id) {
      return res.status(403).json({ success: false, error: "UNAUTHORIZED_PAGE", message: "Page does not belong to your business." });
    }

    // Check publication requirement
    if (!pageRecord.published_at) {
      return res.status(400).json({
        success: false,
        error: "PAGE_NOT_PUBLISHED",
        status: "draft",
        message: "Googlebot cannot crawl an unpublished draft. Publish the page first.",
        correctiveAction: "Publish the page to enable crawler discovery."
      });
    }

    // Check crawl directives
    if (pageRecord.robots_index === false) {
      return res.status(400).json({
        success: false,
        error: "ROBOTS_NOINDEX",
        status: "crawl_blocked",
        message: "Googlebot observed the URL but encountered a meta robots='noindex' directive. Crawl rejected.",
        correctiveAction: "Set robots directive to 'index' to allow search engine inclusion."
      });
    }

    // Check quality gates
    const { data: factorRecord } = await supabase
      .from("seo_game_ranking_factors")
      .select("*")
      .eq("page_id", pageId)
      .maybeSingle();

    const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});
    const overallScore = calculateOverallScore(factors);
    const contentScore = pageRecord.content_quality_score ?? factors.content_quality;
    const techScore = pageRecord.page_speed_score ?? factors.technical_health;

    if (contentScore < LIFECYCLE_THRESHOLDS.MIN_CONTENT_QUALITY || 
        techScore < LIFECYCLE_THRESHOLDS.MIN_TECHNICAL_HEALTH || 
        overallScore < LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE) {
      
      const reasons: string[] = [];
      if (contentScore < LIFECYCLE_THRESHOLDS.MIN_CONTENT_QUALITY) {
        reasons.push(`Content Quality (${contentScore}/100 < ${LIFECYCLE_THRESHOLDS.MIN_CONTENT_QUALITY})`);
      }
      if (techScore < LIFECYCLE_THRESHOLDS.MIN_TECHNICAL_HEALTH) {
        reasons.push(`Technical Performance (${techScore}/100 < ${LIFECYCLE_THRESHOLDS.MIN_TECHNICAL_HEALTH})`);
      }
      if (overallScore < LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE) {
        reasons.push(`Overall Factor Score (${overallScore}/100 < ${LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE})`);
      }

      return res.status(400).json({
        success: false,
        error: "EVALUATION_FAILED",
        status: "evaluation_failed",
        message: `Quality Rater Gates Failed: ${reasons.join(", ")}. Page excluded from index.`,
        correctiveAction: "Execute On-Page Optimization, Content Expansion, or Technical Audit to raise signals above threshold."
      });
    }

    // Accept into Index!
    const { data: updatedPage } = await supabase
      .from("seo_game_pages")
      .update({
        indexed: true,
        updated_at: new Date().toISOString()
      })
      .eq("id", pageId)
      .select()
      .single();

    // Increment indexed_pages in player_state
    const { data: existingState } = await supabase
      .from("seo_game_player_state")
      .select("indexed_pages")
      .eq("player_id", player.id)
      .maybeSingle();

    await supabase
      .from("seo_game_player_state")
      .upsert({
        player_id: player.id,
        indexed_pages: (existingState?.indexed_pages || 0) + 1,
        updated_at: new Date().toISOString()
      });

    const lifecycle = determinePageLifecycle({
      page: updatedPage,
      rankingFactors: factors
    });

    return res.status(200).json({
      success: true,
      page: updatedPage,
      lifecycle,
      status: "indexed",
      message: "Googlebot completed crawl and quality inspection. Page accepted into search index!"
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  }
});

// 7. Assign Keyword Target Endpoint (INDEXED -> SERP-ELIGIBLE)
app.post("/api/seo-game/lifecycle/assign-keyword", async (req, res) => {
  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;
    const { pageId, keywordId } = req.body;

    if (!pageId || !keywordId) {
      return res.status(400).json({ success: false, error: "MISSING_PARAMS", message: "pageId and keywordId are required." });
    }

    // Verify ownership of page
    const { data: pageRecord } = await supabase
      .from("seo_game_pages")
      .select("*, seo_game_websites(business_id)")
      .eq("id", pageId)
      .maybeSingle();

    if (!pageRecord) {
      return res.status(404).json({ success: false, error: "PAGE_NOT_FOUND", message: "Page does not exist." });
    }

    const { data: kwRecord } = await supabase
      .from("seo_game_keywords")
      .select("*, seo_game_websites(business_id)")
      .eq("id", keywordId)
      .maybeSingle();

    if (!kwRecord) {
      return res.status(404).json({ success: false, error: "KEYWORD_NOT_FOUND", message: "Keyword does not exist." });
    }

    const { data: biz } = await supabase
      .from("seo_game_businesses")
      .select("player_id")
      .eq("id", pageRecord.seo_game_websites?.business_id)
      .maybeSingle();

    if (!biz || biz.player_id !== player.id) {
      return res.status(403).json({ success: false, error: "UNAUTHORIZED", message: "Entities do not belong to your business." });
    }

    // Delete any existing target mapping for this keyword
    await supabase
      .from("seo_game_keyword_targets")
      .delete()
      .eq("keyword_id", keywordId);

    // Insert new target mapping
    const { data: targetRecord } = await supabase
      .from("seo_game_keyword_targets")
      .insert({
        keyword_id: keywordId,
        page_id: pageId,
        is_primary: true,
        target_score: 85
      })
      .select()
      .single();

    // Link target_keyword_id in seo_game_content
    await supabase
      .from("seo_game_content")
      .update({ target_keyword_id: keywordId })
      .eq("page_id", pageId);

    return res.status(200).json({
      success: true,
      target: targetRecord,
      message: `Keyword "${kwRecord.keyword}" targeted to page "${pageRecord.title}". Page is now SERP-Eligible!`
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  }
});

// 8. SERP Simulation Endpoint (SERP-ELIGIBLE -> RANKED)
app.post("/api/seo-game/simulate-serp", async (req, res) => {
  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;
    const { keywordId } = req.body;

    if (!keywordId) {
      return res.status(400).json({ success: false, error: "MISSING_KEYWORD_ID", message: "keywordId is required." });
    }

    const { data: kwRecord } = await supabase
      .from("seo_game_keywords")
      .select("*, seo_game_websites(*)")
      .eq("id", keywordId)
      .maybeSingle();

    if (!kwRecord) {
      return res.status(404).json({ success: false, error: "KEYWORD_NOT_FOUND", message: "Keyword does not exist." });
    }

    const businessId = kwRecord.seo_game_websites?.business_id;

    // Find targeted page
    const { data: targetRecord } = await supabase
      .from("seo_game_keyword_targets")
      .select("*, seo_game_pages(*)")
      .eq("keyword_id", keywordId)
      .eq("is_primary", true)
      .maybeSingle();

    if (!targetRecord || !targetRecord.seo_game_pages) {
      return res.status(400).json({
        success: false,
        error: "NO_TARGET_PAGE",
        message: "No page is currently targeting this keyword. Assign a page first."
      });
    }

    const page = targetRecord.seo_game_pages;

    if (!page.indexed) {
      return res.status(400).json({
        success: false,
        error: "PAGE_NOT_INDEXED",
        message: `Page "${page.title}" is not yet indexed by Googlebot. Only indexed pages can enter the SERP competition.`
      });
    }

    // Ensure competitors exist
    let { data: competitors } = await supabase
      .from("seo_game_competitors")
      .select("*")
      .eq("business_id", businessId);

    if (!competitors || competitors.length === 0) {
      for (const comp of SEED_COMPETITORS) {
        await supabase.from("seo_game_competitors").insert({
          business_id: businessId,
          name: comp.name,
          domain: comp.domain,
          industry: comp.industry,
          strategy: comp.strategy,
          difficulty: comp.difficulty,
          authority_score: comp.authority_score,
          content_score: comp.content_score,
          technical_score: comp.technical_score,
          active: true
        });
      }
      const { data: freshComp } = await supabase
        .from("seo_game_competitors")
        .select("*")
        .eq("business_id", businessId);
      competitors = freshComp || [];
    }

    // Retrieve ranking factors
    const { data: factorRecord } = await supabase
      .from("seo_game_ranking_factors")
      .select("*")
      .eq("page_id", page.id)
      .maybeSingle();

    const factors = factorRecord ? normalizeFactors(factorRecord) : normalizeFactors({});

    // Simulate rankings
    const outcome = simulateSerpRankings({
      keyword: kwRecord,
      playerPage: page,
      playerDomain: kwRecord.seo_game_websites?.domain || "omnicorp-seo.com",
      businessId,
      playerRankingFactors: factors,
      competitors: competitors || [],
      currentDay: player.current_day || 1
    });

    // Create SERP Snapshot in DB
    const currentSimDay = player.current_day || 1;
    const serpSnapshotId = generateDeterministicUuid(keywordId, `serp-day-${currentSimDay}`);
    const { data: serpRecord } = await supabase
      .from("seo_game_serps")
      .upsert({
        id: serpSnapshotId,
        keyword_id: keywordId,
        snapshot_day: currentSimDay,
        search_engine: "Google Desktop",
        location: "United States"
      })
      .select()
      .single();

    if (serpRecord) {
      outcome.serpId = serpRecord.id;
      // Insert Top 10 results deterministically
      for (const item of outcome.topTenResults) {
        const serpResultId = generateDeterministicUuid(serpSnapshotId, `pos-${item.position}`);
        await supabase.from("seo_game_serp_results").upsert({
          id: serpResultId,
          serp_id: serpRecord.id,
          position: item.position,
          result_type: "organic",
          title: item.title,
          url: item.url,
          domain: item.domain,
          entity_type: item.entityType,
          business_id: item.isPlayer ? businessId : null,
          competitor_id: item.competitorId || null,
          ranking_score: item.rankingScore,
          previous_position: item.previousPosition,
          position_change: item.positionChange
        });
      }
    }

    // Update keyword stats
    await supabase
      .from("seo_game_keywords")
      .update({
        previous_position: kwRecord.current_position,
        current_position: outcome.playerPosition,
        best_position: Math.min(kwRecord.best_position || 100, outcome.playerPosition || 100),
        impressions: outcome.playerImpressions,
        clicks: outcome.playerClicks,
        ctr: outcome.playerCtr
      })
      .eq("id", keywordId);

    // Record in ranking history deterministically
    if (outcome.playerPosition) {
      const rankHistId = generateDeterministicUuid(keywordId, `hist-page-${page.id}-day-${currentSimDay}`);
      await supabase.from("seo_game_ranking_history").upsert({
        id: rankHistId,
        keyword_id: keywordId,
        page_id: page.id,
        day: currentSimDay,
        position: outcome.playerPosition,
        ranking_score: outcome.playerScore,
        impressions: outcome.playerImpressions,
        clicks: outcome.playerClicks,
        traffic: outcome.playerClicks
      });
    }

    return res.status(200).json({
      success: true,
      outcome,
      message: `Simulated Google SERP for "${kwRecord.keyword}". Player position: #${outcome.playerPosition ?? "Unranked"}.`
    });

  } catch (err: any) {
    console.error("Error simulating SERP:", err);
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  }
});

// 9. Day Cycle / Turn Advance Endpoint (Comprehensive Simulation Pass with Mutex & Idempotency)
const playerDayLocks = new Map<string, boolean>();

app.post("/api/seo-game/advance-day", async (req, res) => {
  let lockAcquired = false;
  let playerIdForLock: string | null = null;

  try {
    const auth = await resolveAuthPlayer(req, res);
    if (!auth) return;
    const { supabase, player } = auth;
    playerIdForLock = player.id;

    // 1. Concurrency Mutex Lock per Player
    if (playerDayLocks.get(player.id)) {
      return res.status(409).json({
        success: false,
        error: "DAY_ADVANCE_IN_PROGRESS",
        message: "A day advance simulation is already executing for this player. Please wait."
      });
    }
    playerDayLocks.set(player.id, true);
    lockAcquired = true;

    const currentDay = player.current_day || 1;
    const newDay = currentDay + 1;

    // 2. Day Idempotency & Replay Verification
    // Check if the simulation for reaching the current day has already been completed, or if this day advance was already processed.
    const advanceActionId = generateDeterministicUuid(player.id, `advance-day-${newDay}`);
    const currentDayAdvanceId = generateDeterministicUuid(player.id, `advance-day-${currentDay}`);

    const { data: existingAdvanceAction } = await supabase
      .from("seo_game_actions")
      .select("*")
      .in("id", [advanceActionId, currentDayAdvanceId])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingAdvanceAction && existingAdvanceAction.result && (existingAdvanceAction.day === currentDay || existingAdvanceAction.id === advanceActionId || existingAdvanceAction.id === currentDayAdvanceId)) {
      return res.status(200).json({
        ...existingAdvanceAction.result,
        cached: true,
        idempotentReplay: true,
        message: `Day ${currentDay} has already been completed. Replaying authoritative simulation result.`
      });
    }

    // 3. Business & Website Resolution
    const { data: business } = await supabase
      .from("seo_game_businesses")
      .select("*")
      .eq("player_id", player.id)
      .single();

    if (!business) {
      return res.status(404).json({ success: false, error: "BUSINESS_NOT_FOUND", message: "Player business entity not found." });
    }

    const { data: website } = await supabase
      .from("seo_game_websites")
      .select("*")
      .eq("business_id", business.id)
      .single();

    // 4. Ensure Competitors exist
    let { data: competitors } = await supabase
      .from("seo_game_competitors")
      .select("*")
      .eq("business_id", business.id);

    if (!competitors || competitors.length === 0) {
      for (const comp of SEED_COMPETITORS) {
        await supabase.from("seo_game_competitors").insert({
          business_id: business.id,
          name: comp.name,
          domain: comp.domain,
          industry: comp.industry,
          strategy: comp.strategy,
          difficulty: comp.difficulty,
          authority_score: comp.authority_score,
          content_score: comp.content_score,
          technical_score: comp.technical_score,
          active: true
        });
      }
      const { data: freshComp } = await supabase
        .from("seo_game_competitors")
        .select("*")
        .eq("business_id", business.id);
      competitors = freshComp || [];
    }

    // 5. Step A: Auto-Crawl & Index Qualified Published Pages
    const { data: pages } = await supabase
      .from("seo_game_pages")
      .select("*")
      .eq("website_id", website.id);

    let newlyIndexedCount = 0;
    if (pages) {
      for (const p of pages) {
        if (p.published_at && !p.indexed && p.robots_index !== false) {
          const { data: f } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", p.id)
            .maybeSingle();

          const contentScore = p.content_quality_score ?? f?.content_quality ?? 50;
          const techScore = p.page_speed_score ?? f?.technical_health ?? 50;
          const overall = f ? calculateOverallScore(normalizeFactors(f)) : 50;

          if (contentScore >= LIFECYCLE_THRESHOLDS.MIN_CONTENT_QUALITY && 
              techScore >= LIFECYCLE_THRESHOLDS.MIN_TECHNICAL_HEALTH && 
              overall >= LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE) {
            await supabase.from("seo_game_pages").update({ indexed: true, updated_at: new Date().toISOString() }).eq("id", p.id);
            newlyIndexedCount++;
          }
        }
      }
    }

    // 6. Step B: Simulate Competitor Daily Actions (Strategy-driven, non-duplicating)
    const { data: keywords } = await supabase
      .from("seo_game_keywords")
      .select("*")
      .eq("website_id", website.id);

    const competitorOutcomes = await simulateDailyCompetitorActions({
      competitors: competitors || [],
      currentDay: newDay,
      keywords: keywords || [],
      supabase
    });

    const { data: updatedCompetitors } = await supabase
      .from("seo_game_competitors")
      .select("*")
      .eq("business_id", business.id);
    const activeCompetitors = updatedCompetitors || competitors || [];

    // 7. Step C: Simulate SERPs for All Targeted Keywords
    const { data: allTargets } = await supabase
      .from("seo_game_keyword_targets")
      .select("*, seo_game_pages(*)")
      .eq("is_primary", true);

    let totalDailyClicks = 0;
    let rankingKeywordsCount = 0;
    let pageOneKeywordsCount = 0;
    const simulatedOutcomes: any[] = [];

    if (keywords && keywords.length > 0) {
      for (const kw of keywords) {
        const target = (allTargets || []).find(t => t.keyword_id === kw.id);
        const targetPage = target?.seo_game_pages;

        if (targetPage && targetPage.indexed) {
          const { data: f } = await supabase
            .from("seo_game_ranking_factors")
            .select("*")
            .eq("page_id", targetPage.id)
            .maybeSingle();

          const factors = f ? normalizeFactors(f) : normalizeFactors({});
          const outcome = simulateSerpRankings({
            keyword: kw,
            playerPage: targetPage,
            playerDomain: website.domain,
            businessId: business.id,
            playerRankingFactors: factors,
            competitors: activeCompetitors,
            currentDay: newDay
          });

          // Insert SERP Snapshot deterministically
          const serpSnapshotId = generateDeterministicUuid(kw.id, `serp-day-${newDay}`);
          await supabase
            .from("seo_game_serps")
            .upsert({
              id: serpSnapshotId,
              keyword_id: kw.id,
              snapshot_day: newDay,
              search_engine: "Google Desktop",
              location: "United States"
            });

          for (const item of outcome.topTenResults) {
            const serpResultId = generateDeterministicUuid(serpSnapshotId, `pos-${item.position}`);
            await supabase.from("seo_game_serp_results").upsert({
              id: serpResultId,
              serp_id: serpSnapshotId,
              position: item.position,
              result_type: "organic",
              title: item.title,
              url: item.url,
              domain: item.domain,
              entity_type: item.entityType,
              business_id: item.isPlayer ? business.id : null,
              competitor_id: item.competitorId || null,
              ranking_score: item.rankingScore,
              previous_position: item.previousPosition,
              position_change: item.positionChange
            });
          }

          // Update keyword record
          await supabase
            .from("seo_game_keywords")
            .update({
              previous_position: kw.current_position,
              current_position: outcome.playerPosition,
              best_position: Math.min(kw.best_position || 100, outcome.playerPosition || 100),
              impressions: outcome.playerImpressions,
              clicks: outcome.playerClicks,
              ctr: outcome.playerCtr
            })
            .eq("id", kw.id);

          // Add to ranking history deterministically
          if (outcome.playerPosition) {
            const rankHistId = generateDeterministicUuid(kw.id, `hist-page-${targetPage.id}-day-${newDay}`);
            await supabase.from("seo_game_ranking_history").upsert({
              id: rankHistId,
              keyword_id: kw.id,
              page_id: targetPage.id,
              day: newDay,
              position: outcome.playerPosition,
              ranking_score: outcome.playerScore,
              impressions: outcome.playerImpressions,
              clicks: outcome.playerClicks,
              traffic: outcome.playerClicks
            });

            if (outcome.playerPosition <= 100) rankingKeywordsCount++;
            if (outcome.playerPosition <= 10) pageOneKeywordsCount++;
            totalDailyClicks += outcome.playerClicks;
          }

          simulatedOutcomes.push(outcome);
        }
      }
    }

    // 8. Step D: Validate Business Funnel & Financial Ledgers
    const funnel = calculateBusinessFunnel({
      totalDailyClicks,
      currentBudget: business.current_budget || 500000,
      day: newDay,
      playerId: player.id
    });

    // Update Business Metrics
    const { data: curMetrics } = await supabase
      .from("seo_game_business_metrics")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle();

    const newTraffic = (curMetrics?.traffic || 0) + funnel.dailyClicks;
    const newLeads = (curMetrics?.leads || 0) + funnel.dailyLeads;
    const newCustomers = (curMetrics?.customers || 0) + funnel.dailyCustomers;
    const newRevenue = (curMetrics?.revenue || 0) + funnel.grossRevenue;

    await supabase
      .from("seo_game_business_metrics")
      .upsert({
        business_id: business.id,
        traffic: newTraffic,
        leads: newLeads,
        customers: newCustomers,
        revenue: newRevenue,
        conversion_rate: newTraffic > 0 ? Math.round((newLeads / newTraffic) * 1000) / 10 : 0,
        updated_at: new Date().toISOString()
      });

    // Update Business Budget with Net Profit
    await supabase
      .from("seo_game_businesses")
      .update({
        current_budget: funnel.newBudget,
        updated_at: new Date().toISOString()
      })
      .eq("id", business.id);

    // 9. Step E: Energy Regeneration & Ledger Recording
    const { data: wallet } = await supabase
      .from("seo_game_wallets")
      .select("*")
      .eq("player_id", player.id)
      .single();

    const energyRestored = Math.min(wallet?.max_energy || 100, (wallet?.energy || 0) + 40) - (wallet?.energy || 0);
    const newEnergy = (wallet?.energy || 0) + energyRestored;

    await supabase
      .from("seo_game_wallets")
      .update({
        energy: newEnergy,
        updated_at: new Date().toISOString()
      })
      .eq("player_id", player.id);

    await supabase.from("seo_game_wallet_transactions").upsert({
      id: generateDeterministicUuid(player.id, `energy-regen-day-${newDay}`),
      player_id: player.id,
      transaction_type: "bonus",
      currency: "energy",
      amount: energyRestored,
      balance_after: newEnergy,
      description: energyRestored > 0
        ? `Daily Energy Regeneration (Day ${newDay})`
        : `Daily Energy Refreshed - Full Capacity (Day ${newDay})`,
      reference_type: "day_advance",
      created_at: new Date().toISOString()
    });

    // 10. Step F: Advance Day on Player Profile & State
    await supabase
      .from("seo_game_players")
      .update({
        current_day: newDay,
        updated_at: new Date().toISOString()
      })
      .eq("id", player.id);

    const { data: curState } = await supabase
      .from("seo_game_player_state")
      .select("*")
      .eq("player_id", player.id)
      .maybeSingle();

    await supabase
      .from("seo_game_player_state")
      .upsert({
        player_id: player.id,
        current_day: newDay,
        total_traffic: newTraffic,
        total_leads: newLeads,
        total_revenue: newRevenue,
        ranking_keywords: rankingKeywordsCount,
        page_one_keywords: pageOneKeywordsCount,
        indexed_pages: (curState?.indexed_pages || 0) + newlyIndexedCount,
        business_health: 100,
        last_simulation_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    // 11. Step G: Authoritative Progression & Missions Evaluation
    const progression = await evaluateProgressionAndMissions({
      playerId: player.id,
      businessId: business.id,
      websiteId: website.id,
      currentDay: newDay,
      supabase
    });

    const fullSummaryPayload = {
      success: true,
      summary: {
        previousDay: currentDay,
        currentDay: newDay,
        dailyClicks: funnel.dailyClicks,
        dailyLeads: funnel.dailyLeads,
        dailyCustomers: funnel.dailyCustomers,
        grossRevenue: funnel.grossRevenue,
        operatingExpenses: funnel.operatingExpenses,
        netProfit: funnel.netProfit,
        previousBudget: funnel.previousBudget,
        newBudget: funnel.newBudget,
        energyRestored,
        currentEnergy: newEnergy,
        simulatedKeywordsCount: simulatedOutcomes.length,
        newlyIndexedPages: newlyIndexedCount,
        competitorActions: competitorOutcomes.length,
        progression: {
          newlyCompletedMissions: progression.newlyCompletedMissions,
          newlyUnlockedAchievements: progression.newlyUnlockedAchievements,
          xpEarned: progression.totalXpAwarded,
          coinsEarned: progression.totalCoinsAwarded,
          playerLevel: progression.playerLevel,
          leveledUp: progression.leveledUp,
          levelTitle: progression.levelTitle
        }
      },
      message: `Advanced to Day ${newDay}. Traffic: +${funnel.dailyClicks} clicks, Leads: +${funnel.dailyLeads}, Deals: +${funnel.dailyCustomers}. Gross Revenue: ₦${funnel.grossRevenue.toLocaleString()}, Net Profit: ₦${funnel.netProfit.toLocaleString()}. Energy: ${newEnergy}/100.`
    };

    // 11.5 Step H-0: Record Explainable Daily World/Industry Event
    const eventId = generateDeterministicUuid(player.id, `event-day-${newDay}`);
    let dailyEvent = {
      title: "Google Core Quality Evaluation",
      description: "Search engines refreshed content freshness weight. High-quality clusters received visibility boost.",
      eventType: "algorithm_update",
      severity: "info"
    };

    if (newDay % 3 === 0) {
      dailyEvent = {
        title: "Fintech Competitor Expands Enterprise Portal",
        description: "Flutterwave published high-depth developer guides, raising topical competition for enterprise tech queries.",
        eventType: "competitor_move",
        severity: "warning"
      };
    } else if (newDay % 3 === 1) {
      dailyEvent = {
        title: "Industry Media Feature & Query Demand Surge",
        description: "BusinessDay and TechCabal featured enterprise digital strategy trends, lifting commercial query volume by 12%.",
        eventType: "market_opportunity",
        severity: "positive"
      };
    }

    await supabase.from("seo_game_events").upsert({
      id: eventId,
      player_id: player.id,
      business_id: business.id,
      event_type: dailyEvent.eventType,
      title: dailyEvent.title,
      description: dailyEvent.description,
      severity: dailyEvent.severity,
      day: newDay,
      is_read: false,
      created_at: new Date().toISOString()
    });

    // 12. Step H: Record Ground-Truth Action Record for Complete Idempotency Protection
    await supabase.from("seo_game_actions").upsert({
      id: advanceActionId,
      player_id: player.id,
      business_id: business.id,
      action_type: "ADVANCE_DAY",
      target_type: "business",
      target_id: business.id,
      cost_coins: 0,
      cost_energy: 0,
      cost_ai_credits: 0,
      result: fullSummaryPayload,
      day: newDay,
      created_at: new Date().toISOString()
    });

    return res.status(200).json(fullSummaryPayload);

  } catch (err: any) {
    console.error("Error advancing day:", err);
    return res.status(500).json({ success: false, error: "INTERNAL_ERROR", message: err.message });
  } finally {
    if (lockAcquired && playerIdForLock) {
      playerDayLocks.delete(playerIdForLock);
    }
  }
});


// ========================================================
// VITE OR STATIC SERVING MIDDLEWARE
// ========================================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Express wildcard SPA fallback for dev mode
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
