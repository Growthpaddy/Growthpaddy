import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UserX,
  XCircle,
  Ban
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logAuditEvent } from '../../lib/auditLogger';

type FounderStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
type FounderFilter = 'all' | FounderStatus;

interface FounderAccount {
  id: string;
  user_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  business_name?: string | null;
  website?: string | null;
  location?: string | null;
  profile_status?: FounderStatus | string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

const fetchFounderAccounts = async (): Promise<FounderAccount[]> => {
  const { data, error } = await supabase
    .from('founder_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as FounderAccount[];
};

const statusLabel = (status?: string | null) => {
  switch ((status || 'pending').toLowerCase()) {
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'suspended': return 'Suspended';
    default: return 'Pending Review';
  }
};

const statusClass = (status?: string | null) => {
  switch ((status || 'pending').toLowerCase()) {
    case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'suspended': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-amber-50 text-amber-800 border-amber-200';
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const FounderManagementPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FounderFilter>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const {
    data: founders = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin', 'founder-accounts'],
    queryFn: fetchFounderAccounts,
    staleTime: 30_000
  });

  const updateStatus = useMutation({
    mutationFn: async ({ founder, nextStatus }: { founder: FounderAccount; nextStatus: FounderStatus }) => {
      const { data, error } = await supabase
        .from('founder_profiles')
        .update({
          profile_status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', founder.id)
        .select('id, profile_status')
        .single();

      if (error) throw error;
      if (!data) throw new Error('The founder account was not updated. Refresh the list and try again.');
      return { founder, nextStatus };
    },
    onSuccess: async ({ founder, nextStatus }) => {
      setActionError(null);
      setActionSuccess(`${founder.full_name || founder.email || 'Founder'}: ${statusLabel(nextStatus)}.`);
      await logAuditEvent({
        action_type: nextStatus === 'approved' ? 'APPROVAL' : nextStatus === 'rejected' ? 'REVOCATION' : 'STATUS_CHANGE',
        description: `Founder account status changed to ${nextStatus} for ${founder.full_name || founder.email || founder.id}`,
        target_id: founder.id,
        metadata: {
          account_type: 'founder',
          email: founder.email || null,
          previous_status: founder.profile_status || 'pending',
          next_status: nextStatus
        }
      });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'founder-accounts'] });
    },
    onError: (mutationError: any) => {
      setActionSuccess(null);
      setActionError(mutationError?.message || 'Unable to update this founder account.');
    }
  });

  const counts = useMemo(() => ({
    all: founders.length,
    pending: founders.filter(f => (f.profile_status || 'pending') === 'pending').length,
    approved: founders.filter(f => f.profile_status === 'approved').length,
    rejected: founders.filter(f => f.profile_status === 'rejected').length,
    suspended: founders.filter(f => f.profile_status === 'suspended').length
  }), [founders]);

  const filteredFounders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return founders.filter(founder => {
      const status = (founder.profile_status || 'pending').toLowerCase();
      const matchesStatus = filter === 'all' || status === filter;
      const matchesSearch = !query || [
        founder.full_name,
        founder.email,
        founder.business_name,
        founder.location
      ].some(value => (value || '').toLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [founders, filter, search]);

  const handleStatusChange = (founder: FounderAccount, nextStatus: FounderStatus) => {
    setActionError(null);
    setActionSuccess(null);
    updateStatus.mutate({ founder, nextStatus });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <UserRound className="w-4 h-4" />
            Founder account management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Founder Accounts</h1>
          <p className="text-sm text-slate-500 mt-1">Review registrations and approve, reject, suspend or restore each founder account.</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh founders
        </button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
        {([
          ['all', 'Total Founders', UsersIcon],
          ['pending', 'Pending Review', Clock],
          ['approved', 'Approved', CheckCircle2],
          ['rejected', 'Rejected', XCircle],
          ['suspended', 'Suspended', Ban]
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`text-left bg-white rounded-2xl border p-4 transition hover:border-emerald-300 hover:shadow-sm ${filter === key ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-500">{label}</span>
              <Icon className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{counts[key]}</div>
          </button>
        ))}
      </div>

      {actionError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}
      {actionSuccess && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Registered Founders</h2>
            <p className="text-xs text-slate-500 mt-0.5">{filteredFounders.length} account{filteredFounders.length === 1 ? '' : 's'} shown</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative min-w-0 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, email, business..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5" />
              {filter === 'all' ? 'All statuses' : statusLabel(filter)}
            </div>
          </div>
        </div>

        {error ? (
          <div className="p-8 sm:p-12 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Founder accounts could not be loaded</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl mx-auto">{(error as any)?.message || 'Check the founder_profiles table and its administrator read policy.'}</p>
            <button onClick={() => refetch()} className="mt-4 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold">Try again</button>
          </div>
        ) : isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" /> Loading founder accounts...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-600">
                  <th className="py-3.5 px-5 font-semibold">Founder</th>
                  <th className="py-3.5 px-4 font-semibold">Business</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Registered</th>
                  <th className="py-3.5 px-4 font-semibold">Account Status</th>
                  <th className="py-3.5 px-5 text-right font-semibold">Approval Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFounders.length ? filteredFounders.map(founder => {
                  const status = (founder.profile_status || 'pending').toLowerCase();
                  const isUpdating = updateStatus.isPending && updateStatus.variables?.founder.id === founder.id;
                  return (
                    <tr key={founder.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{founder.full_name || 'Founder account'}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                          <Mail className="w-3 h-3" /> {founder.email || 'No email recorded'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">{founder.business_name || 'Not provided'}</div>
                        {founder.website && (
                          <a href={founder.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline mt-1">
                            Website <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {founder.location ? <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{founder.location}</span> : '—'}
                      </td>
                      <td className="px-4 py-4 text-slate-500">{formatDate(founder.created_at)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusClass(status)}`}>
                          {status === 'approved' ? <Check className="w-3 h-3" /> : status === 'rejected' ? <XCircle className="w-3 h-3" /> : status === 'suspended' ? <Ban className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {statusLabel(status)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {status !== 'approved' && status !== 'suspended' && (
                            <button
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => handleStatusChange(founder, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                              Approve
                            </button>
                          )}
                          {status === 'pending' && (
                            <button
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => handleStatusChange(founder, 'rejected')}
                              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <UserX className="w-3 h-3" /> Reject
                            </button>
                          )}
                          {status === 'approved' && (
                            <button
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => handleStatusChange(founder, 'suspended')}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Ban className="w-3 h-3" /> Suspend
                            </button>
                          )}
                          {status === 'suspended' && (
                            <button
                              type="button"
                              disabled={updateStatus.isPending}
                              onClick={() => handleStatusChange(founder, 'approved')}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Restore Access
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-slate-400">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <div className="font-semibold text-slate-600">No founder accounts found</div>
                      <div className="text-[11px] mt-1">New founder registrations will appear here for review.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400">Approvals update the founder account's <code>profile_status</code> in Supabase. Each action is also recorded in the admin audit log.</p>
    </section>
  );
};

const UsersIcon = UserRound;

export default FounderManagementPanel;
