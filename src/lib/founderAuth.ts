import { supabase } from './supabaseClient';

export interface FounderProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  business_name?: string | null;
  website?: string | null;
  profile_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at?: string;
  updated_at?: string;
}

export interface RegisterFounderInput {
  full_name: string;
  email: string;
  password: string;
  business_name?: string;
  website?: string;
}

export interface LoginFounderInput {
  email: string;
  password: string;
}

const STORAGE_KEY = 'dc_founder_profile';
const TOKEN_KEY = 'dc_founder_token';

/**
 * Validates a website URL format (optional field).
 */
export function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return true;
  try {
    const formatted = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    new URL(formatted);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats website URL to ensure it has https:// prefix when stored/linked.
 */
export function normalizeUrl(url?: string | null): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates founder registration input.
 */
export function validateFounderRegistration(input: RegisterFounderInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!input.full_name || !input.full_name.trim()) {
    errors.full_name = 'Full name is required.';
  } else if (input.full_name.trim().length < 2) {
    errors.full_name = 'Please enter your complete full name.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !input.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!emailRegex.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!input.password) {
    errors.password = 'Password is required.';
  } else if (input.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  if (input.website && input.website.trim()) {
    if (!isValidUrl(input.website.trim())) {
      errors.website = 'Please enter a valid website address (e.g. yourbrand.com or https://yourbrand.com).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Registers a new founder account using the server endpoint and Supabase Auth.
 */
export async function registerFounder(
  input: RegisterFounderInput
): Promise<{ success: boolean; profile?: FounderProfile; error?: string }> {
  const validation = validateFounderRegistration(input);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    return { success: false, error: firstError };
  }

  const payload = {
    full_name: input.full_name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    business_name: input.business_name?.trim() || null,
    website: normalizeUrl(input.website)
  };

  try {
    // 1. Call server API endpoint
    const response = await fetch('/api/founders/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errorMsg = data?.error || data?.message || 'Registration failed. Please try again.';
      return { success: false, error: errorMsg };
    }

    return {
      success: true,
      profile: data.profile || data.user
    };
  } catch (err: any) {
    console.error('Founder registration network error:', err);
    return {
      success: false,
      error: 'Unable to connect to the server. Please check your internet connection and try again.'
    };
  }
}

/**
 * Signs in a founder using their email and password.
 */
export async function loginFounder(
  input: LoginFounderInput
): Promise<{
  success: boolean;
  profile?: FounderProfile;
  session?: any;
  error?: string;
}> {
  if (!input.email || !input.email.trim()) {
    return { success: false, error: 'Email address is required.' };
  }
  if (!input.password) {
    return { success: false, error: 'Password is required.' };
  }

  const cleanEmail = input.email.trim().toLowerCase();

  try {
    // 1. Direct Supabase auth attempt client-side
    let clientAuthSuccess = false;
    let clientSession: any = null;
    let clientUser: any = null;

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: input.password
      });

      if (!authError && authData?.session) {
        clientAuthSuccess = true;
        clientSession = authData.session;
        clientUser = authData.user;
      }
    } catch (sbErr) {
      console.warn('Client Supabase signIn notice:', sbErr);
    }

    // 2. Call server endpoint to fetch/enrich the founder profile
    const response = await fetch('/api/founders/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(clientSession?.access_token ? { Authorization: `Bearer ${clientSession.access_token}` } : {})
      },
      body: JSON.stringify({
        email: cleanEmail,
        password: input.password
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      if (!clientAuthSuccess) {
        const errorMsg = data?.error || data?.message || 'Invalid email or password. Please verify your credentials.';
        return { success: false, error: errorMsg };
      }
    }

    const finalProfile: FounderProfile = data?.profile || {
      id: clientUser?.id || `founder_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`,
      user_id: clientUser?.id,
      full_name: clientUser?.user_metadata?.full_name || cleanEmail.split('@')[0],
      email: cleanEmail,
      business_name: clientUser?.user_metadata?.business_name || null,
      website: clientUser?.user_metadata?.website || null,
      profile_status: clientUser?.user_metadata?.profile_status || 'pending',
      created_at: new Date().toISOString()
    };

    // Cache profile in localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalProfile));
      if (clientSession?.access_token || data?.token) {
        localStorage.setItem(TOKEN_KEY, clientSession?.access_token || data?.token);
      }
    } catch {
      // storage unavailable
    }

    return {
      success: true,
      profile: finalProfile,
      session: clientSession || data?.session
    };
  } catch (err: any) {
    console.error('Founder login error:', err);
    return {
      success: false,
      error: 'An unexpected connection error occurred. Please try again in a few moments.'
    };
  }
}

/**
 * Returns the currently active cached founder profile, if any.
 */
export function getCachedFounderProfile(): FounderProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return null;
}

/**
 * Signs out the founder and removes all cached session tokens.
 */
export async function logoutFounder(): Promise<void> {
  try {
    await supabase.auth.signOut().catch(() => {});
  } catch {
    // ignore
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/**
 * Sends a password reset email request.
 */
export async function requestFounderPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!email || !email.trim() || !email.includes('@')) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  try {
    // Client-side supabase password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/founders/login`
    });

    if (error) {
      // Fallback to server route
      const res = await fetch('/api/founders/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        return { success: true, message: data.message || 'Password reset link sent to your email.' };
      }
    }

    return {
      success: true,
      message: 'If an account exists for this email, you will receive password reset instructions shortly.'
    };
  } catch (err) {
    return {
      success: true,
      message: 'If an account exists for this email, you will receive password reset instructions shortly.'
    };
  }
}
