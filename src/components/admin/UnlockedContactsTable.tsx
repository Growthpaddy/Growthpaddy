import React, { useEffect, useState, useMemo } from 'react';
import { 
  Building2, 
  User, 
  Search, 
  RefreshCw, 
  Calendar, 
  Mail, 
  Phone, 
  Key, 
  ExternalLink, 
  Filter,
  ShieldCheck,
  FolderX,
  Clock,
  Briefcase
} from 'lucide-react';
import { fetchUnlockedContacts, UnlockedContactRecord } from '../../lib/unlockedContacts';

export const UnlockedContactsTable: React.FC = () => {
  const [records, setRecords] = useState<UnlockedContactRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUnlockedContacts();
      setRecords(data);
    } catch (err) {
      console.error('Error loading unlocked contact audits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    const now = Date.now();

    return records.filter((r) => {
      // Time filter
      if (timeFilter !== 'all') {
        const days = timeFilter === '7d' ? 7 : 30;
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        const unlockedTime = new Date(r.unlocked_at).getTime();
        if (unlockedTime < cutoff) return false;
      }

      if (!term) return true;

      const recruiterComp = r.recruiters?.company_name || '';
      const recruiterEmail = r.recruiters?.email || '';
      const recruiterContact = r.recruiters?.contact_name || '';
      const talentName = r.talent_profiles?.full_name || '';
      const talentEmail = r.talent_profiles?.email || '';
      const talentRole = r.talent_profiles?.primary_role || r.talent_profiles?.role || r.talent_profiles?.specialization || '';

      return (
        recruiterComp.toLowerCase().includes(term) ||
        recruiterEmail.toLowerCase().includes(term) ||
        recruiterContact.toLowerCase().includes(term) ||
        talentName.toLowerCase().includes(term) ||
        talentEmail.toLowerCase().includes(term) ||
        talentRole.toLowerCase().includes(term)
      );
    });
  }, [records, searchTerm, timeFilter]);

  return (
    <div id="unlocked-contacts-audit-panel" className="space-y-6 text-left">
      {/* Top Title Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Key className="w-4 h-4" />
            <span>Recruiter Engagement Audit</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Unlocked Contacts Ledger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of recruiters unlocking direct candidate contact details and resumes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh unlocked contacts ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Audit Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filters & Search */}
        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company, recruiter, candidate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  timeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Time ({records.length})
              </button>
              <button
                onClick={() => setTimeFilter('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  timeFilter === '30d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeFilter('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  timeFilter === '7d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
            <p>Loading unlocked contact audit logs from Supabase...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <FolderX className="w-10 h-10 mx-auto text-slate-300" />
            <div>
              <p className="text-xs font-bold text-slate-700">No Unlocked Contact Records Found</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
                When recruiters unlock contact credentials for vetted candidates, records will be logged here.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Recruiter / Enterprise</th>
                  <th className="py-3 px-4">Target Candidate</th>
                  <th className="py-3 px-4">Specialization</th>
                  <th className="py-3 px-4">Unlocked Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((item) => {
                  const recruiterCompany = item.recruiters?.company_name || 'Enterprise Recruiter';
                  const recruiterEmail = item.recruiters?.email || 'N/A';
                  const talentName = item.talent_profiles?.full_name || 'Anonymous Candidate';
                  const talentEmail = item.talent_profiles?.email || 'N/A';
                  const talentRole = 
                    item.talent_profiles?.primary_role || 
                    item.talent_profiles?.role || 
                    item.talent_profiles?.specialization || 
                    'Growth Marketing Specialist';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* Recruiter */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{recruiterCompany}</span>
                            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {recruiterEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Unlocked Candidate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-emerald-950 block">{talentName}</span>
                            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {talentEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Candidate Specialization */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          <Briefcase className="w-3 h-3 text-slate-500" />
                          {talentRole}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {item.unlocked_at ? new Date(item.unlocked_at).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnlockedContactsTable;
