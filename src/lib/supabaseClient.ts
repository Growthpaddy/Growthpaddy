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

/**
 * Inserts a skill into the talent_profiles.skills array (if not already present),
 * updates Supabase, and returns the updated profile object.
 *
 * @param talent_id - The ID of the talent profile
 * @param skill_name - The category or name of the skill to accredit
 */
export async function addSkillToTalent(talent_id: string, skill_name: string) {
  if (!talent_id || !skill_name) {
    console.warn('addSkillToTalent called with missing arguments:', { talent_id, skill_name });
    return null;
  }

  const trimmedSkill = skill_name.trim();
  if (!trimmedSkill) return null;

  try {
    // 1. Fetch current profile
    const { data: profile, error: fetchErr } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('id', talent_id)
      .maybeSingle();

    if (fetchErr) {
      console.warn('Error fetching talent profile in addSkillToTalent:', fetchErr);
    }

    let currentSkills: string[] = [];
    if (profile && Array.isArray(profile.skills)) {
      currentSkills = [...profile.skills];
    } else if (profile && typeof profile.skills === 'string') {
      try {
        const parsed = JSON.parse(profile.skills);
        if (Array.isArray(parsed)) currentSkills = parsed;
      } catch {
        currentSkills = [profile.skills];
      }
    } else {
      // LocalStorage fallback cache if database is unreachable or profile not found
      try {
        const cachedRaw =
          localStorage.getItem(`dsp_talent_profile_${talent_id}`) ||
          localStorage.getItem('dsp_talent_profile');
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw);
          if (Array.isArray(parsed?.skills)) currentSkills = parsed.skills;
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. Check if skill is already present
    const exists = currentSkills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase());
    const updatedSkills = exists ? currentSkills : [...currentSkills, trimmedSkill];

    // 3. Update talent_profiles table
    const { data: updatedProfile, error: updateErr } = await supabase
      .from('talent_profiles')
      .update({
        skills: updatedSkills,
        updated_at: new Date().toISOString()
      })
      .eq('id', talent_id)
      .select('*')
      .maybeSingle();

    if (updateErr) {
      console.warn('Error updating talent skills in supabase:', updateErr);
    }

    const finalProfile =
      updatedProfile ||
      (profile ? { ...profile, skills: updatedSkills } : { id: talent_id, skills: updatedSkills });

    // 4. Update local storage caches
    try {
      localStorage.setItem(`dsp_talent_profile_${talent_id}`, JSON.stringify(finalProfile));
      localStorage.setItem('dsp_talent_profile', JSON.stringify(finalProfile));
    } catch (e) {
      // ignore
    }

    return finalProfile;
  } catch (err) {
    console.error('addSkillToTalent unexpected error:', err);
    return null;
  }
}
