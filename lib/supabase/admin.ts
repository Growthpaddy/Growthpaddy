import { createClient } from '@supabase/supabase-js';

/**
 * Administrative Service Role Client
 * 
 * CRITICAL SECURITY INVARIANT:
 * - Uses `SUPABASE_SERVICE_ROLE_KEY`, which completely BYPASSES PostgreSQL Row Level Security (RLS).
 * - MUST NEVER be imported into or invoked from Client Components.
 * - Guarded with runtime environment assertions.
 */
export function createAdminServiceClient() {
  // Enforce runtime server check
  if (typeof window !== 'undefined') {
    throw new Error(
      '[CRITICAL SECURITY EXCEPTION] Attempted to instantiate Supabase Service Role client in a browser environment! This operation has been blocked.'
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('[Security Exception] Missing NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }

  if (!serviceRoleKey) {
    throw new Error(
      '[Security Exception] Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Administrative actions requiring service bypass cannot proceed.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
