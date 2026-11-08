import React, { useEffect, useState } from 'react';
import { ArrowUpRight, UserRound } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { getAuthenticatedFounderProfile, type FounderProfile } from '../../lib/founderAuth';

interface FounderFloatingAccessProps {
  hidden?: boolean;
  onGoToDashboard: () => void;
}

/**
 * Persistent shortcut shown while an approved founder has an active Supabase session.
 * The profile is re-verified from the current Auth user; localStorage is never used.
 */
export const FounderFloatingAccess: React.FC<FounderFloatingAccessProps> = ({
  hidden = false,
  onGoToDashboard
}) => {
  const [profile, setProfile] = useState<FounderProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    let requestVersion = 0;

    const loadVerifiedProfile = async () => {
      const version = ++requestVersion;
      try {
        const verifiedProfile = await getAuthenticatedFounderProfile({ requireApproved: true });
        if (mounted && version === requestVersion) setProfile(verifiedProfile);
      } catch {
        if (mounted && version === requestVersion) setProfile(null);
      }
    };

    void loadVerifiedProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        requestVersion += 1;
        setProfile(null);
        return;
      }

      // Run after the auth callback returns to avoid holding the Supabase auth lock.
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        window.setTimeout(() => {
          if (mounted) void loadVerifiedProfile();
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (hidden || !profile) return null;

  const initials = profile.full_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'F';

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[90] group">
      <button
        type="button"
        onClick={onGoToDashboard}
        aria-label={`Return to ${profile.full_name}'s Founder Dashboard`}
        title="Return to Founder Dashboard"
        className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-[3px] border-white bg-[#063d2d] shadow-[0_12px_40px_rgba(3,45,32,0.28)] ring-2 ring-emerald-500/70 transition duration-200 hover:scale-105 hover:ring-emerald-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-full w-full rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-[#063d2d] text-sm font-extrabold text-white">
            {initials || <UserRound className="h-6 w-6" />}
          </span>
        )}
        <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-[3px] border-white bg-emerald-400" />
      </button>
      <div className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl bg-[#062a20] px-3.5 py-2.5 text-left text-white opacity-0 shadow-xl transition group-hover:block group-hover:opacity-100 sm:block sm:group-hover:opacity-100">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">Signed in</p>
        <p className="mt-0.5 text-xs font-semibold">{profile.full_name}</p>
        <p className="mt-1 flex items-center gap-1 text-[10px] text-emerald-100/80">
          Return to Founder Workspace <ArrowUpRight className="h-3 w-3" />
        </p>
      </div>
    </div>
  );
};

export default FounderFloatingAccess;
