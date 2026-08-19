import { supabase } from './supabase';

export interface UnlockedContactRecord {
  id: string;
  recruiter_id?: string;
  talent_id?: string;
  unlocked_at: string;
  recruiters: {
    id: string;
    company_name?: string;
    email?: string;
    contact_name?: string;
  } | null;
  talent_profiles: {
    id: string;
    full_name?: string;
    email?: string;
    primary_role?: string;
    role?: string;
    specialization?: string;
    hourly_rate?: number | string;
  } | null;
}

export async function fetchUnlockedContacts(): Promise<UnlockedContactRecord[]> {
  try {
    const { data, error } = await supabase
      .from('unlocked_contacts')
      .select(`
        id,
        recruiter_id,
        talent_id,
        unlocked_at,
        recruiters (
          id,
          company_name,
          email,
          contact_name
        ),
        talent_profiles (
          id,
          full_name,
          email,
          primary_role,
          role,
          specialization,
          hourly_rate
        )
      `)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.warn('Error fetching unlocked contacts from Supabase:', error.message);
      return [];
    }

    return (data || []) as unknown as UnlockedContactRecord[];
  } catch (err: any) {
    console.error('Failed to fetch unlocked contacts records:', err);
    return [];
  }
}
