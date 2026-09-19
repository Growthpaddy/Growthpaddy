import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { generateResumePdfStream, StrictResumeData } from "./src/server/generateResumePdf";
import { MOCK_TALENT } from "./src/data/mockTalent";

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

// 0. Recruiter Signup Endpoint - Direct persistence to public.recruiters via Service Role
app.post("/api/recruiter/signup", async (req, res) => {
  try {
    const { email, password, companyName, contactPerson, phoneNumber, selectedPackage, industry, companySize, userId } = req.body;
    
    if (!email || !companyName) {
      return res.status(400).json({ error: "Email and Company Name are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCompany = companyName.trim();
    const cleanContact = contactPerson || cleanCompany;
    const cleanPhone = phoneNumber || "";
    const chosenPackage = (selectedPackage === "Enterprise" || selectedPackage === "Growth") ? selectedPackage : "Starter";
    const maxContacts = chosenPackage === "Enterprise" ? 99999 : chosenPackage === "Growth" ? 25 : 5;

    const supabase = getSupabaseClient();

    // Check if recruiter already exists in public.recruiters
    const { data: existingRec } = await supabase
      .from("recruiters")
      .select("*")
      .ilike("business_email", cleanEmail)
      .maybeSingle();

    if (existingRec) {
      // Update recruiter record with latest submitted package and details in Supabase
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
        .eq("id", existingRec.id)
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

// 0b. Recruiter Login Helper Endpoint - Verifies recruiter directly in Supabase
app.post("/api/recruiter/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();
    const { data: recruiter, error } = await supabase
      .from("recruiters")
      .select("*")
      .ilike("business_email", cleanEmail)
      .maybeSingle();

    if (error || !recruiter) {
      return res.status(404).json({ error: "No recruiter found with this business email" });
    }

    return res.json({
      success: true,
      recruiter
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Login failed" });
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
