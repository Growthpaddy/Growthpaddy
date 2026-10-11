import { supabase } from '../../src/lib/supabaseClient';

/**
 * Public Client-Side Supabase Instance
 * Re-uses the unified singleton client configured with direct static environment access.
 */
export function createClient() {
  return supabase;
}
