import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Configuration Warning]: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables are not set. ' +
    'Please set these in your .env or hosting environment to connect to your Supabase backend.'
  );
}

// Initialize Supabase Client with graceful fallback to prevent module-load crashes
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-ref.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

export default supabase;
