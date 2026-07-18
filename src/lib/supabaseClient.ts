import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * 
 * To run this application with your live Supabase backend:
 * 1. Create a `.env` or `.env.local` file in your root folder.
 * 2. Add your Supabase URL and Anon Key as follows:
 *    VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
 *    VITE_SUPABASE_ANON_KEY="your-public-anon-key"
 * 
 * In production or your deployment settings, ensure these variables are declared in
 * your hosting environment config.
 */

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://placeholder-ref.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (supabaseUrl === 'https://placeholder-ref.supabase.co' || supabaseAnonKey === 'placeholder-anon-key') {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. ' +
    'The app will use mock fallbacks or placeholder credentials until they are provided.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
