import { createBrowserClient } from '@supabase/ssr';

/**
 * Public Client-Side Supabase Instance
 * 
 * Uses ONLY the public anonymous key (NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * All queries executed with this client are strictly subject to PostgreSQL Row Level Security (RLS).
 * SAFE for client-side bundle execution.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (import.meta as any)?.env?.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '[Security Alert] Supabase client environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
