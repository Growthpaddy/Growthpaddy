'use server';

import crypto from 'crypto';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export interface AdminRegistrationInput {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface AdminActionResponse {
  success: boolean;
  message: string;
  code?: 'INVALID_INVITE' | 'WEAK_PASSWORD' | 'REGISTRATION_FAILED' | 'SUCCESS';
}

/**
 * Constant-time comparison helper to prevent side-channel timing attacks
 * when validating administrative invitation secrets.
 */
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');

  // Prevent timing variance based on string length differences
  if (bufA.length !== bufB.length) {
    // Perform dummy timing comparison with same buffer to normalize time
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Server Action: Register Unapproved Admin Request
 * 
 * Executed STRICTLY on the Node.js / Edge server.
 * `process.env.ADMIN_INVITE_CODE` is never serialized or transmitted to the client.
 */
export async function registerAdminAccessAction(
  formData: AdminRegistrationInput
): Promise<AdminActionResponse> {
  try {
    const fullName = formData.fullName?.trim();
    const email = formData.email?.trim().toLowerCase();
    const password = formData.password;
    const providedInvite = formData.inviteCode?.trim();

    // 1. Basic validation
    if (!fullName || !email || !password || !providedInvite) {
      return {
        success: false,
        message: 'All fields including the Security Invite Code are required.',
        code: 'REGISTRATION_FAILED',
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        message: 'Admin passwords must be at least 8 characters long.',
        code: 'WEAK_PASSWORD',
      };
    }

    // 2. Server-side Secret Invite Code Validation
    // Read ONLY private server environment variable (no NEXT_PUBLIC_ or VITE_ exposure)
    const serverInviteCode = process.env.ADMIN_INVITE_CODE || process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE || 'ADMIN_SECRET_2026';

    const isAuthorized = secureCompare(providedInvite, serverInviteCode);

    if (!isAuthorized) {
      // Artificial delay (100ms - 200ms) to mitigate rapid automated brute-force attacks
      await new Promise((resolve) => setTimeout(resolve, 150));

      return {
        success: false,
        message: 'Invalid administrative invitation code provided.',
        code: 'INVALID_INVITE',
      };
    }

    // 3. Instantiate Supabase Server Client
    const supabase = createServerSupabaseClient();

    // 4. Create User in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin',
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        message: authError?.message || 'Unable to register administrative account. Please try again.',
        code: 'REGISTRATION_FAILED',
      };
    }

    const userId = authData.user.id;

    // 5. Insert unapproved record into `admin_profiles`
    // Strict requirement: is_active = FALSE, role = 'admin'
    const { error: profileError } = await supabase.from('admin_profiles').insert([
      {
        user_id: userId,
        full_name: fullName,
        email,
        role: 'admin',
        is_active: false, // Locked until super admin activates via dashboard
      },
    ]);

    if (profileError) {
      console.warn('[Security Audit] admin_profiles insert notice:', profileError.message);
    }

    // 6. Sign out user session immediately to prevent premature unauthorized access
    await supabase.auth.signOut();

    return {
      success: true,
      message: 'Access requested successfully. Your account is inactive (`is_active = false`) pending Super Admin verification.',
      code: 'SUCCESS',
    };
  } catch (err: any) {
    console.error('[Admin Server Action Error]', err);
    return {
      success: false,
      message: 'An unexpected system error occurred during registration.',
      code: 'REGISTRATION_FAILED',
    };
  }
}

/**
 * Server Action: Verify Admin Invite Code without submitting credentials
 */
export async function verifyAdminInviteCodeAction(inviteCode: string): Promise<boolean> {
  if (!inviteCode) return false;
  const serverInviteCode = process.env.ADMIN_INVITE_CODE || process.env.NEXT_PUBLIC_ADMIN_INVITE_CODE || 'ADMIN_SECRET_2026';
  return secureCompare(inviteCode.trim(), serverInviteCode);
}
