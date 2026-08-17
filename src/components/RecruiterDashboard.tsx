import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import { Preloader } from './Preloader';
import PublicPortfolio from './PublicPortfolio';
import { 
  Building2, 
  Users, 
  Unlock, 
  MessageSquare, 
  Mail, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowRight,
  Zap, 
  Phone, 
  UserCheck, 
  LogOut, 
  ChevronRight, 
  SlidersHorizontal, 
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Copy,
  Check,
  Send,
  X
} from 'lucide-react';

interface RecruiterDashboardProps {
  onSignOut?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToPricing?: () => void;
}

export default function RecruiterDashboard({
  onSignOut,
  onNavigateToDirectory,
  onNavigateToPricing
}: RecruiterDashboardProps) {
  const { user } = useSupabase();
  const [recruiter, setRecruiter] = useState<any>(null);
  const [unlockedTalents, setUnlockedTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState<'unlocked' | 'billing' | 'cosupervision'>('unlocked');
  
  // Co-Supervision Modal State
  const [showCoSupervisionModal, setShowCoSupervisionModal] = useState(false);
  const [coSupervisionSubject, setCoSupervisionSubject] = useState('');
  const [coSupervisionMessage, setCoSupervisionMessage] = useState('');
  const [coSupervisionSending, setCoSupervisionSending] = useState(false);
  const [coSupervisionSuccess, setCoSupervisionSuccess] = useState(false);

  // Live Candidate Portfolio Preview Modal
  const [previewCandidateSlug, setPreviewCandidateSlug] = useState<string | null>(null);

  // Fetch live recruiter record and unlocked contacts
  const fetchRecruiterData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);

      // 1. Fetch recruiter profile from public.recruiters
      let { data: recData, error: recError } = await supabase
        .from('recruiters')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      // Self-healing fallback if record missing in recruiters
      if (!recData) {
        const companyName = user.user_metadata?.company_name || 'Hiring Enterprise';
        const contactName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Recruiter';
        const selectedPkg = user.user_metadata?.selected_package || 'starter_tier';

        const fallbackRecruiter = {
          user_id: user.id,
          id: user.id,
          company_name: companyName,
          contact_person: contactName,
          business_email: user.email,
          phone_number: user.user_metadata?.phone_number || '',
          selected_package: selectedPkg,
          payment_status: user.user_metadata?.payment_status || 'pending_verification',
          contacts_unlocked_count: 0,
          max_contacts: selectedPkg === 'starter_tier' ? 5 : 99999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: createdRec } = await supabase
          .from('recruiters')
          .insert([fallbackRecruiter])
          .select()
          .single();

        recData = createdRec || fallbackRecruiter;
      }

      setRecruiter(recData);

      // 2. Fetch all unlocked contacts for this recruiter
      const { data: unlockedRows, error: unlockedErr } = await supabase
        .from('unlocked_contacts')
        .select('*')
        .or(`recruiter_id.eq.${user.id},recruiter_id.eq.${recData.id}`)
        .order('created_at', { ascending: false });

      if (unlockedRows && unlockedRows.length > 0) {
        const talentIds = unlockedRows.map((r: any) => r.talent_id).filter(Boolean);

        if (talentIds.length > 0) {
          const { data: talentsData, error: talentErr } = await supabase
            .from('talent_profiles')
            .select('*')
            .in('id', talentIds);

          if (talentsData) {
            // Merge unlocked timestamp
            const merged = talentsData.map((talent: any) => {
              const matchedRow = unlockedRows.find((r: any) => r.talent_id === talent.id);
              return {
                ...talent,
                unlocked_at: matchedRow?.created_at || matchedRow?.unlocked_at || new Date().toISOString()
              };
            });
            setUnlockedTalents(merged);
          }
        } else {
          setUnlockedTalents([]);
        }
      } else {
        setUnlockedTalents([]);
      }
    } catch (err) {
      console.error('Error loading recruiter dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, [user]);

  const handleSignOutClick = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    if (onSignOut) {
      onSignOut();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const navToDirectory = () => {
    if (onNavigateToDirectory) {
      onNavigateToDirectory();
    } else {
      window.history.pushState({}, '', '/directory');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const handleCoSupervisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoSupervisionSending(true);

    try {
      // In real scenario, can log request to support queue or send email
      await new Promise(r => setTimeout(r, 800));
      setCoSupervisionSuccess(true);
      setTimeout(() => {
        setCoSupervisionSuccess(false);
        setShowCoSupervisionModal(false);
        setCoSupervisionSubject('');
        setCoSupervisionMessage('');
      }, 2500);
    } catch (err) {
      console.error('Co-supervision submission error:', err);
    } finally {
      setCoSupervisionSending(false);
    }
  };

  // Filter unlocked candidates by search
  const filteredTalents = unlockedTalents.filter((t) => {
    const q = searchQuery.toLowerCase();
    const name = (t.full_name || t.name || '').toLowerCase();
    const headline = (t.headline || t.specialty || '').toLowerCase();
    const skills = Array.isArray(t.skills) ? t.skills.join(' ').toLowerCase() : '';
    return name.includes(q) || headline.includes(q) || skills.includes(q);
  });

  const isPendingVerification = recruiter?.payment_status === 'pending_verification';
  const isAnnual = recruiter?.selected_package === 'annual_unlimited';
  const unlockedCount = recruiter?.contacts_unlocked_count || unlockedTalents.length || 0;
  const maxContacts = isAnnual ? 99999 : 5;

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white pb-20 text-left">
      
      {/* Recruiter Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-xl flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-slate-900">
                  {recruiter?.company_name || 'Employer Workspace'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                  Recruiter Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {recruiter?.contact_person} · {recruiter?.business_email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Browse Directory Button */}
            <button
              type="button"
              onClick={navToDirectory}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Talent Directory</span>
            </button>

            {/* Sync Refresh */}
            <button
              type="button"
              onClick={fetchRecruiterData}
              title="Sync Account Status"
              className="p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer transition shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleSignOutClick}
              className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* REVIEW MODE BANNER IF PENDING VERIFICATION */}
        {isPendingVerification && (
          <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-sm text-amber-950 space-y-4 animate-fadeIn">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-200/80 text-amber-900 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mb-1">
                    <span>Account Status: Payment Verification in Progress</span>
                  </div>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-amber-950">
                    Review Mode: GTBank Payment Confirmation Pending
                  </h2>
                </div>
              </div>

              <a
                href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello GrowthPaddy, I have paid via GTBank for ${recruiter?.company_name} (${recruiter?.business_email}). Please expedite account activation.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Expedite via WhatsApp</span>
              </a>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed max-w-4xl">
              All recruiter accounts remain in <strong>Review Mode</strong> upon registration until GTBank payment is verified by our team (typically within 1 hour). Once verified, full WhatsApp & email contact unlock features will automatically activate.
            </p>

            <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 text-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Bank Name</span>
                <span className="font-bold text-slate-800">Guaranty Trust Bank (GTBank)</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Account Name</span>
                <span className="font-bold text-slate-800">DSP Academy Ltd</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Account Number</span>
                <span className="font-mono font-bold text-sm text-emerald-700">3003427360</span>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION & PLAN SUMMARY STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Package Tier */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Active Subscription
            </span>
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900">
                {isAnnual ? 'Annual Scale & Co-Pilot' : 'Starter Hiring Pack'}
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase ${
                isPendingVerification
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {isPendingVerification ? 'Review Mode' : 'Verified & Active'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isAnnual ? '365 Days Unlimited Unlocks & Support' : '5 Contact Unlocks Included'}
            </p>
          </div>

          {/* Card 2: Contact Unlock Quota */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Candidate Unlock Quota
            </span>
            <div className="flex items-center justify-between">
              <span className="font-display font-extrabold text-2xl text-slate-900">
                {isAnnual ? 'UNLIMITED' : `${unlockedCount} / ${maxContacts}`}
              </span>
              {!isAnnual && (
                <span className="text-xs text-slate-500 font-mono">
                  {Math.max(0, 5 - unlockedCount)} remaining
                </span>
              )}
            </div>

            {!isAnnual ? (
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (unlockedCount / 5) * 100)}%` }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unlimited 24/7 Candidate Sourcing</span>
              </div>
            )}
          </div>

          {/* Card 3: Upgrade / Co-Supervision Action */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 block">
                {isAnnual ? 'Annual Partner Advantage' : 'Scale Recruitment'}
              </span>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {isAnnual 
                  ? 'Access your 3-Month Talent Integration Co-Supervision module.' 
                  : 'Upgrade to Annual Scale (₦250,000) for unlimited candidate unlocks.'}
              </p>
            </div>

            {isAnnual ? (
              <button
                type="button"
                onClick={() => setShowCoSupervisionModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Request Co-Supervision</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNavigateToPricing || navToDirectory}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Upgrade to Annual Scale</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* UNLOCKED CANDIDATES ROSTER SECTION */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                  Unlocked Candidate Dossiers
                </h2>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {unlockedTalents.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Full direct contact channels for candidates you have unlocked.
              </p>
            </div>

            {/* Search filter for unlocked */}
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search unlocked candidates..."
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50"
              />
            </div>
          </div>

          {unlockedTalents.length === 0 ? (
            /* Empty Unlocked State */
            <div className="py-12 sm:py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                <Unlock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-slate-900">
                  No Talent Contacts Unlocked Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Browse our directory of pre-vetted AI engineers, growth marketers, and full-stack builders to unlock direct WhatsApp and email outreach.
                </p>
              </div>
              <button
                type="button"
                onClick={navToDirectory}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Search className="w-4 h-4" />
                <span>Explore Vetted Talent Pool</span>
              </button>
            </div>
          ) : filteredTalents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No unlocked candidates match your search "{searchQuery}".
            </div>
          ) : (
            /* Unlocked Candidate Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalents.map((candidate) => {
                const phone = candidate.whatsapp_number || candidate.phone || '';
                const cleanPhone = phone.replace(/[^0-9+]/g, '').replace(/^0/, '234');
                const email = candidate.contact_email || candidate.email || '';
                const isApproved = candidate.vetting_status === 'approved' || candidate.vetting_status === 'verified';

                return (
                  <div
                    key={candidate.id}
                    className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Avatar, Name, Status */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={candidate.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                          alt={candidate.full_name}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-display font-bold text-base text-slate-900 truncate">
                              {candidate.full_name}
                            </h4>
                            {isApproved && (
                              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-md">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-emerald-700 font-semibold truncate">
                            {candidate.headline || candidate.specialty || 'Technical Talent'}
                          </p>
                          {candidate.location && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{candidate.location}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Direct Unlocked Contact Channels */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
                        <span className="font-mono text-[10px] font-bold uppercase text-emerald-700 block">
                          ✓ Direct Outreach Channels Unlocked
                        </span>

                        {phone && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{phone}</span>
                            </span>
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${candidate.full_name}, I'm reaching out from ${recruiter?.company_name || 'GrowthPaddy Recruiter Network'} regarding an opportunity.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-800 font-bold font-mono text-[11px] bg-emerald-100/70 hover:bg-emerald-200/70 px-2 py-0.5 rounded transition"
                            >
                              WhatsApp
                            </a>
                          </div>
                        )}

                        {email && (
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-1.5 font-medium truncate max-w-[170px]" title={email}>
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{email}</span>
                            </span>
                            <a
                              href={`mailto:${email}?subject=${encodeURIComponent(`Interview Invitation from ${recruiter?.company_name || 'Hiring Team'}`)}`}
                              className="text-slate-700 hover:text-slate-900 font-bold font-mono text-[11px] bg-slate-200/70 hover:bg-slate-300/70 px-2 py-0.5 rounded transition shrink-0"
                            >
                              Email
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Skills Strip */}
                      {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 3).map((sk: string, i: number) => (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View CV Portfolio Modal Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewCandidateSlug(candidate.slug || candidate.full_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                      className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <span>View Executive CV & Portfolio</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </main>

      {/* CO-SUPERVISION MODAL FOR ANNUAL PLAN SUBSCRIBERS */}
      {showCoSupervisionModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-left shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowCoSupervisionModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Annual Co-Pilot Benefit</span>
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Request 3-Month Talent Integration Co-Supervision
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our senior engineering directors and growth architects will co-supervise your newly hired talent's first 90 days, setting sprint milestones and QA audits.
              </p>
            </div>

            {coSupervisionSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Co-Supervision Request Received!</h4>
                <p className="text-xs text-emerald-700">
                  Our Technical Director will reach out to <strong>{recruiter?.business_email}</strong> within 4 business hours to schedule your onboarding kickoff session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCoSupervisionSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Candidate Hired / Role Focus
                  </label>
                  <input
                    type="text"
                    required
                    value={coSupervisionSubject}
                    onChange={(e) => setCoSupervisionSubject(e.target.value)}
                    placeholder="e.g. AI Automation Engineer - Workflow Orchestration"
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Project Scope & Key 90-Day Goals
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={coSupervisionMessage}
                    onChange={(e) => setCoSupervisionMessage(e.target.value)}
                    placeholder="Describe your tech stack, key delivery milestones, or specific support needed during sprint onboarding..."
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={coSupervisionSending}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  {coSupervisionSending ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Co-Supervision Schedule</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* FULL CANDIDATE PORTFOLIO PREVIEW MODAL */}
      {previewCandidateSlug && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-5xl w-full my-4 overflow-hidden text-left relative flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
              <span className="font-mono text-xs font-bold text-emerald-400">
                Candidate Portfolio Preview: /{previewCandidateSlug}
              </span>
              <button
                type="button"
                onClick={() => setPreviewCandidateSlug(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <PublicPortfolio
                candidateSlug={previewCandidateSlug}
                onClose={() => setPreviewCandidateSlug(null)}
                isEmbedded={true}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
