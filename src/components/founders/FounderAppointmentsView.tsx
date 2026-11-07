import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Video, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Mail,
  X
} from 'lucide-react';
import { FounderAppointment } from '../../types';

interface FounderAppointmentsViewProps {
  appointments: FounderAppointment[];
  onOpenSchedule: () => void;
  onUpdateStatus: (id: string, status: 'upcoming' | 'completed' | 'cancelled') => void;
  onDeleteAppointment: (id: string) => void;
}

export const FounderAppointmentsView: React.FC<FounderAppointmentsViewProps> = ({
  appointments,
  onOpenSchedule,
  onUpdateStatus,
  onDeleteAppointment
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const upcomingCount = appointments.filter(a => a.status === 'upcoming').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Founder Appointments &amp; Mentorship
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track conversations with prospective hires, co-founders, investors, and mentees.
          </p>
        </div>

        <button
          onClick={onOpenSchedule}
          className="self-start sm:self-auto inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs transition active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Appointment</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#059669] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Upcoming ({upcomingCount})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#059669] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#059669] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Completed ({completedCount})
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'cancelled'
              ? 'bg-[#059669] text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* APPOINTMENTS LIST */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAppointments.map((app) => {
            const startDate = new Date(app.start_time);
            const dateStr = startDate.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const timeStr = startDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Status & Date */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      app.status === 'upcoming'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : app.status === 'completed'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{dateStr} · {timeStr}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-black text-base text-slate-900 leading-snug">
                    {app.title}
                  </h3>

                  {/* Attendee Info */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.attendee_name}</span>
                    </div>
                    {app.attendee_email && (
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.attendee_email}</span>
                      </div>
                    )}
                  </div>

                  {app.notes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/60 leading-relaxed">
                      "{app.notes}"
                    </p>
                  )}
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {app.meeting_url ? (
                    <a
                      href={app.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs py-2 px-3.5 rounded-xl transition cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No link provided</span>
                  )}

                  <div className="flex items-center gap-1.5">
                    {app.status === 'upcoming' && (
                      <>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'completed')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(app.id, 'cancelled')}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Cancel Appointment"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm('Delete this appointment record?')) {
                          onDeleteAppointment(app.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <CalendarClock className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No Appointments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have no appointments in this status. Schedule one to keep your calendar organized.
          </p>
          <button
            onClick={onOpenSchedule}
            className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      )}

    </div>
  );
};
