import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, MapPin, RefreshCw, Sparkles, Users } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

type PublicFounder = {
  id: string;
  full_name: string;
  business_name: string | null;
  website: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  slug: string | null;
  location: string | null;
};

type WeeklyFounder = PublicFounder & {
  slot: number;
  week_start: string;
};

const PAGE_SIZE = 10;

function FounderAvatar({ founder, large = false }: { founder: PublicFounder; large?: boolean }) {
  const initials = founder.full_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'F';

  return (
    <div className={`${large ? 'h-24 w-24 sm:h-28 sm:w-28' : 'h-16 w-16'} shrink-0 overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow-md`}>
      {founder.avatar_url ? (
        <img src={founder.avatar_url} alt={founder.full_name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200 text-xl font-extrabold text-emerald-800">
          {initials}
        </div>
      )}
    </div>
  );
}

function FounderCard({ founder, featured = false, slot }: {
  founder: PublicFounder;
  featured?: boolean;
  slot?: number;
  key?: React.Key;
}) {
  return (
    <article className={featured
      ? 'relative flex min-h-[245px] flex-col overflow-hidden rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_18px_55px_rgba(6,78,59,0.10)] sm:p-8'
      : 'flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg'}
    >
      {featured && <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-emerald-50" />}
      {featured && (
        <span className="relative mb-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" /> Founder of the Week {slot ? `· ${slot}` : ''}
        </span>
      )}
      <div className="relative flex items-center gap-4">
        <FounderAvatar founder={founder} large={featured} />
        <div className="min-w-0">
          <h3 className={`${featured ? 'text-xl sm:text-2xl' : 'text-lg'} font-extrabold tracking-tight text-slate-950`}>
            {founder.full_name}
          </h3>
          {founder.business_name && <p className="mt-1 text-sm font-semibold text-emerald-800">{founder.business_name}</p>}
          {founder.location && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5" />{founder.location}</p>}
        </div>
      </div>
      {founder.headline && <p className={`${featured ? 'mt-5 text-base' : 'mt-4 text-sm'} font-semibold text-slate-700`}>{founder.headline}</p>}
      {founder.bio && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{founder.bio}</p>}
      <div className="mt-auto pt-5">
        {founder.website ? (
          <a
            href={founder.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#087448] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#065f3b]"
          >
            Visit website <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="text-xs font-medium text-slate-400">Digital Campux Founder</span>
        )}
      </div>
    </article>
  );
}

interface FounderDirectoryPageProps {
  canManageWeeklyFeatures?: boolean;
}

export const FounderDirectoryPage: React.FC<FounderDirectoryPageProps> = ({ canManageWeeklyFeatures = false }) => {
  const [founders, setFounders] = useState<PublicFounder[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [weeklyFounders, setWeeklyFounders] = useState<WeeklyFounder[]>([]);
  const [founderOptions, setFounderOptions] = useState<PublicFounder[]>([]);
  const [firstSelection, setFirstSelection] = useState('');
  const [secondSelection, setSecondSelection] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureError, setFeatureError] = useState<string | null>(null);
  const [featureNotice, setFeatureNotice] = useState<string | null>(null);

  const loadFounders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const start = (page - 1) * PAGE_SIZE;
    const { data, count, error: queryError } = await supabase
      .from('founder_profiles_public')
      .select('*', { count: 'exact' })
      .order('full_name', { ascending: true })
      .range(start, start + PAGE_SIZE - 1);

    if (queryError) {
      setError(`We couldn't load the founder directory: ${queryError.message}`);
      setFounders([]);
      setTotalCount(0);
    } else {
      setFounders((data || []) as PublicFounder[]);
      setTotalCount(count || 0);
    }
    setIsLoading(false);
  }, [page]);

  const loadWeeklyFounders = useCallback(async () => {
    setFeatureError(null);
    const { data, error: queryError } = await supabase
      .from('founder_weekly_features_public')
      .select('*')
      .order('slot', { ascending: true });

    if (queryError) {
      setFeatureError(`Weekly founder highlights are unavailable: ${queryError.message}`);
      setWeeklyFounders([]);
      return;
    }

    const records = (data || []) as WeeklyFounder[];
    setWeeklyFounders(records);
    setFirstSelection(records.find((item) => item.slot === 1)?.id || '');
    setSecondSelection(records.find((item) => item.slot === 2)?.id || '');
  }, []);

  useEffect(() => {
    void loadFounders();
  }, [loadFounders]);

  useEffect(() => {
    void loadWeeklyFounders();
  }, [loadWeeklyFounders]);

  useEffect(() => {
    if (!canManageWeeklyFeatures) return;
    let mounted = true;
    const loadOptions = async () => {
      const { data, error: queryError } = await supabase
        .from('founder_profiles_public')
        .select('*')
        .order('full_name', { ascending: true });
      if (!mounted) return;
      if (queryError) {
        setFeatureError(`Unable to load founder choices: ${queryError.message}`);
      } else {
        setFounderOptions((data || []) as PublicFounder[]);
      }
    };
    void loadOptions();
    return () => { mounted = false; };
  }, [canManageWeeklyFeatures]);

  const saveWeeklyFeatures = async () => {
    if (!firstSelection || !secondSelection || firstSelection === secondSelection) {
      setFeatureError('Select two different approved founders.');
      return;
    }

    setIsSavingFeatures(true);
    setFeatureError(null);
    setFeatureNotice(null);
    const { error: saveError } = await supabase.rpc('set_founder_weekly_features', {
      p_first_founder_id: firstSelection,
      p_second_founder_id: secondSelection
    });
    if (saveError) {
      setFeatureError(`Could not publish the weekly selection: ${saveError.message}`);
    } else {
      setFeatureNotice('This week’s featured founders have been updated.');
      await loadWeeklyFounders();
    }
    setIsSavingFeatures(false);
  };

  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">
      <section className="relative overflow-hidden bg-[#05271d] text-white">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-300">Digital Campux Community</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Meet the founders building what’s next.</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/75 sm:text-base">
            Discover approved founders in the Digital Campux community, the businesses they are building and the work they are putting into the world.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-emerald-50">
            <Users className="h-4 w-4 text-emerald-300" /> {totalCount.toLocaleString()} approved {totalCount === 1 ? 'founder' : 'founders'}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        {canManageWeeklyFeatures && (
          <section className="mb-12 rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">Administrator tools</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-950">Choose this week’s founders</h2>
                <p className="mt-1 text-sm text-slate-500">Select two different approved founders for the weekly spotlight.</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">Two slots</span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <label className="block text-xs font-bold text-slate-600">Founder of the Week · Slot 1
                <select value={firstSelection} onChange={(event) => setFirstSelection(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500">
                  <option value="">Select founder</option>
                  {founderOptions.map((founder) => <option key={founder.id} value={founder.id}>{founder.full_name}{founder.business_name ? ` — ${founder.business_name}` : ''}</option>)}
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-600">Founder of the Week · Slot 2
                <select value={secondSelection} onChange={(event) => setSecondSelection(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500">
                  <option value="">Select founder</option>
                  {founderOptions.filter((founder) => founder.id !== firstSelection).map((founder) => <option key={founder.id} value={founder.id}>{founder.full_name}{founder.business_name ? ` — ${founder.business_name}` : ''}</option>)}
                </select>
              </label>
            </div>
            {featureError && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{featureError}</p>}
            {featureNotice && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">{featureNotice}</p>}
            <button type="button" onClick={saveWeeklyFeatures} disabled={isSavingFeatures || founderOptions.length < 2} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087448] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#065f3b] disabled:cursor-not-allowed disabled:opacity-50">
              {isSavingFeatures ? 'Publishing…' : 'Publish weekly founders'} <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        <section className="mb-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">Community spotlight</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Founders of the Week</h2>
              <p className="mt-2 text-sm text-slate-500">Two founders selected by the Digital Campux team each week.</p>
            </div>
          </div>
          {weeklyFounders.length === 2 ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {weeklyFounders.map((founder) => <FounderCard key={`${founder.week_start}-${founder.slot}`} founder={founder} featured slot={founder.slot} />)}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-10 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-emerald-600" />
              <p className="mt-3 font-bold text-slate-800">This week’s founders will be announced soon.</p>
              <p className="mt-1 text-sm text-slate-500">The Digital Campux team selects two community founders every week.</p>
            </div>
          )}
          {featureError && !canManageWeeklyFeatures && <p className="mt-3 text-xs text-amber-700">{featureError}</p>}
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">The community</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">All approved founders</h2>
              <p className="mt-2 text-sm text-slate-500">A growing network of people building businesses and creating opportunities.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">Showing {founders.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}</span>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-56 animate-pulse rounded-3xl border border-slate-100 bg-white" />)}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-100 bg-white p-8 text-center">
              <p className="text-sm text-rose-700">{error}</p>
              <button onClick={() => void loadFounders()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" /> Retry</button>
            </div>
          ) : founders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Users className="mx-auto h-8 w-8 text-emerald-700" />
              <p className="mt-3 font-bold text-slate-800">No approved founders to display yet.</p>
              <p className="mt-1 text-sm text-slate-500">Approved community profiles will appear here.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {founders.map((founder) => <FounderCard key={founder.id} founder={founder} />)}
            </div>
          )}

          {!isLoading && !error && pageCount > 1 && (
            <div className="mt-9 flex items-center justify-between border-t border-slate-200 pt-6">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 disabled:cursor-not-allowed disabled:opacity-40">
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs font-semibold text-slate-500">Page {page} of {pageCount}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page >= pageCount} className="inline-flex items-center gap-2 rounded-xl bg-[#087448] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#065f3b] disabled:cursor-not-allowed disabled:opacity-40">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FounderDirectoryPage;
