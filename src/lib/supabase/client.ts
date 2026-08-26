import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabase as existingClient } from '../supabaseClient';

export function createClient() {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder-ref.supabase.co';
  const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder-ref.supabase.co') {
    return existingClient;
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}
