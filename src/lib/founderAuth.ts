import { supabase } from './supabaseClient';

export interface FounderProfile {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  headline?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  slug?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
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

function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message?: unknown }).message || '').trim();
    if (message) return message;
  }
  return fallback;
}

export function isValidUrl(url: string): boolean {
  if (!url.trim()) return true;
  try {
    new URL(normalizeUrl(url) || '');
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url?: string | null): string | null {
  const value = url?.trim();
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function validateFounderRegistration(input: RegisterFounderInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const fullName = input.full_name?.trim() || '';
  const email = input.email?.trim() || '';

  if (fullName.length < 2) errors.full_name = 'Please enter your complete full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  // The server registration endpoint requires a minimum of eight characters.
  if (!input.password || input.password.length < 8) errors.password = 'Password must be at least 8 characters long.';
  if (input.website?.trim() && !isValidUrl(input.website)) {
    errors.website = 'Please enter a valid website address (e.g. yourbrand.com).';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Create the Auth user and its database profile through the trusted server endpoint. */
export async function registerFounder(
  input: RegisterFounderInput
): Promise<{ success: boolean; profile?: FounderProfile; error?: string }> {
  const validation = validateFounderRegistration(input);
  if (!validation.isValid) {
    return { success: false, error: Object.values(validation.errors)[0] };
  }

  try {
    const response = await fetch('/api/founders/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: input.full_name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        business_name: input.business_name?.trim() || null,
        website: normalizeUrl(input.website)
      })
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.success || !payload?.profile?.id) {
      return {
        success: false,
        error: payload?.error || payload?.message || 'Registration could not be completed. Please try again.'
      };
    }

    return { success: true, profile: payload.profile as FounderProfile };
  } catch (error) {
    return {
      success: false,
      error: errorMessage(error, 'Unable to connect to the registration service. Please try again.')
    };
  }
}

/**
 * Resolve the founder profile from the verified Supabase Auth user.
 * The local profile cache is deliberately not used as an identity source.
 */
export async function getAuthenticatedFounderProfile(options: { requireApproved?: boolean } = {}): Promise<FounderProfile> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(`Unable to verify your sign-in: ${userError.message}`);
  const user = userData.user;
  if (!user) throw new Error('Your session is not active. Please sign in again.');

  const { data: profile, error: profileError } = await supabase
    .from('founder_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Unable to load your founder profile: ${profileError.message}`);
  }
  if (!profile) {
    throw new Error('Your account does not have a founder profile. Please contact Digital Campux support.');
  }
  if (profile.id !== user.id) {
    throw new Error('Your founder profile does not match the active account. Please sign in again.');
  }

  const founderProfile = profile as FounderProfile;
  if (options.requireApproved !== false && founderProfile.profile_status !== 'approved') {
    const statusMessages: Record<string, string> = {
      pending: 'Your founder application is awaiting approval. You will be able to access the workspace after approval.',
      rejected: 'Your founder application was not approved. Please contact Digital Campux support.',
      suspended: 'Your founder workspace access is suspended. Please contact Digital Campux support.'
    };
    throw new Error(statusMessages[founderProfile.profile_status] || 'Your founder account is not approved for workspace access.');
  }

  return founderProfile;
}

/** Authenticate directly with Supabase Auth, then verify the matching founder profile. */
export async function loginFounder(
  input: LoginFounderInput
): Promise<{ success: boolean; profile?: FounderProfile; error?: string }> {
  const email = input.email?.trim().toLowerCase();
  if (!email) return { success: false, error: 'Email address is required.' };
  if (!input.password) return { success: false, error: 'Password is required.' };

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (signInError) return { success: false, error: signInError.message };

  try {
    const profile = await getAuthenticatedFounderProfile({ requireApproved: true });
    return { success: true, profile };
  } catch (error) {
    // Do not leave an authenticated but unapproved/mismatched founder session active.
    await supabase.auth.signOut();
    return { success: false, error: errorMessage(error, 'Unable to verify this founder account.') };
  }
}

/** Sign out from the authoritative Supabase Auth session. */
export async function logoutFounder(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Could not sign out: ${error.message}`);
}

export async function requestFounderPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${window.location.origin}/founders/login`
  });

  if (error) {
    return {
      success: false,
      message: 'We could not process the password reset request right now. Please try again.'
    };
  }

  // Avoid disclosing whether an email address exists in Auth.
  return {
    success: true,
    message: 'If an account exists for this email, you will receive password reset instructions shortly.'
  };
}
