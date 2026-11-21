import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ChevronDown, 
  Check, 
  X, 
  Bot,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotApi } from '../api';
import { appointmentApi, type Appointment } from '../api/appointmentApi';
import { useToast } from '../hooks/useToast';

export const Appointments: React.FC = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [selectedChatbotId, setSelectedChatbotId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  // Fetch user's chatbots list for the selector dropdown
  const { data: chatbots = [] } = useQuery<any[]>({
    queryKey: ['chatbots'],
    queryFn: () => chatbotApi.getChatbots() as Promise<any[]>,
  });

  // Fetch appointments for selected chatbot or all user's chatbots
  const { 
    data: appointments = [], 
    isLoading, 
    isFetching,
    refetch 
  } = useQuery<Appointment[]>({
    queryKey: ['appointments', selectedChatbotId],
    queryFn: () => appointmentApi.getAppointments(selectedChatbotId || undefined),
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) =>
      appointmentApi.updateAppointmentStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`Appointment marked as ${variables.status}.`, 'Status Updated');
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to update appointment status.';
      toast.error(msg, 'Update Failed');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentApi.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment deleted successfully.', 'Deleted');
    },
    onError: (err: any) => {
      const msg = err.message || 'Failed to delete appointment.';
      toast.error(msg, 'Delete Failed');
    },
  });

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      // Status filter
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }
      // Search term filter (name, email, contact_number, reason)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = (appt.name || '').toLowerCase().includes(query);
        const matchesEmail = (appt.email || '').toLowerCase().includes(query);
        const matchesPhone = (appt.contact_number || '').toLowerCase().includes(query);
        const matchesReason = (appt.reason || '').toLowerCase().includes(query);
        const matchesTime = (appt.time || '').toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesReason && !matchesTime) {
          return false;
        }
      }
      return true;
    });
  }, [appointments, statusFilter, searchTerm]);

  // Status counts for summary cards and filter tabs
  const counts = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    return { total, pending, confirmed, cancelled, completed };
  }, [appointments]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#10D6A0]/10 text-[#10D6A0] border border-[#10D6A0]/20">
            <CheckCircle2 className="w-3 h-3 text-[#10D6A0]" /> Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FB7185]/10 text-[#FB7185] border border-[#FB7185]/20">
            <XCircle className="w-3 h-3 text-[#FB7185]" /> Cancelled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Check className="w-3 h-3 text-cyan-400" /> Completed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20 animate-pulse">
            <Clock className="w-3 h-3 text-[#FBBF24]" /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans w-full max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <header className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#142342] border border-[#243653] text-[#C7D2FE] text-[11px] font-semibold flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-400" />
              Appointments & Leads
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F3F6FF] tracking-tight">
            Booked Appointments
          </h1>
          <p className="text-[#A3B3CF] text-xs sm:text-sm max-w-xl">
            Customer appointment queries booked through your website AI chat and real-time voice agents.
          </p>
        </div>

        {/* Chatbot Selector & Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <div className="relative min-w-[240px]">
            <select
              value={selectedChatbotId}
              onChange={(e) => setSelectedChatbotId(e.target.value)}
              className="appearance-none bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-4 pr-10 py-2.5 text-xs font-semibold text-[#F3F6FF] focus:outline-none focus:border-[#4F46E5] cursor-pointer w-full transition-colors hover:border-[#243653]"
            >
              <option value="">All Chatbots ({chatbots.length})</option>
              {chatbots.map((bot) => (
                <option key={bot.id} value={bot.id}>
                  {bot.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#71829F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-[#101D39] border border-[#1C2C4B] rounded-xl text-[#A3B3CF] hover:text-[#F3F6FF] hover:bg-[#142342] transition-colors flex items-center justify-center"
            title="Refresh appointments"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </header>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71829F] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-[#F3F6FF]">{counts.total}</div>
        </div>

        <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71829F] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold text-[#FBBF24]">{counts.pending}</div>
        </div>

        <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71829F] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-[#10D6A0]" />
          </div>
          <div className="text-2xl font-bold text-[#10D6A0]">{counts.confirmed}</div>
        </div>

        <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71829F] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cancelled / Other</span>
            <XCircle className="w-4 h-4 text-[#FB7185]" />
          </div>
          <div className="text-2xl font-bold text-[#A3B3CF]">{counts.cancelled + counts.completed}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-glow-sm'
                  : 'text-[#71829F] hover:text-[#F3F6FF] hover:bg-[#101D39]'
              }`}
            >
              {st} {st !== 'all' && `(${counts[st]})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#71829F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#101D39] border border-[#1C2C4B] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F3F6FF] placeholder-[#71829F] focus:outline-none focus:border-[#4F46E5] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71829F] hover:text-[#F3F6FF]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Full-Width Appointments Table */}
      <div className="bg-[#0D1730] border border-[#1C2C4B] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#71829F]">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#101D39] border border-[#1C2C4B] flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="font-display text-base font-bold text-[#F3F6FF] mb-1">
              {searchTerm || statusFilter !== 'all' ? 'No Matching Appointments' : 'No Appointments Booked Yet'}
            </h3>
            <p className="text-xs text-[#71829F] max-w-sm mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try clearing your search query or switching the status filter tab.'
                : 'When visitors book an appointment via your chat widget or voice agent, their details will appear here.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#101D39] text-indigo-300 border border-[#1C2C4B] hover:bg-[#142342] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1C2C4B] bg-[#091121]/60 text-[#71829F] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Chatbot</th>
                  <th className="py-3.5 px-5">Preferred Time</th>
                  <th className="py-3.5 px-5">Reason / Message</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2C4B]/60">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#101D39]/40 transition-colors group">
                    {/* Customer Info */}
                    <td className="py-4 px-5 align-top">
                      <div className="font-bold text-[#F3F6FF] text-sm flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        {appt.name}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[#A3B3CF] text-[11px]">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#71829F]" />
                          <a href={`mailto:${appt.email}`} className="hover:text-indigo-300 underline-offset-2 hover:underline">
                            {appt.email}
                          </a>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#71829F]" />
                          <a href={`tel:${appt.contact_number}`} className="hover:text-indigo-300">
                            {appt.contact_number}
                          </a>
                        </span>
                      </div>
                    </td>

                    {/* Chatbot Name */}
                    <td className="py-4 px-5 align-top">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#101D39] border border-[#1C2C4B] text-[#C7D2FE] font-medium text-[11px]">
                        <Bot className="w-3 h-3 text-indigo-400" />
                        {appt.chatbot_name || 'Chatbot'}
                      </span>
                    </td>

                    {/* Preferred Time */}
                    <td className="py-4 px-5 align-top text-[#F3F6FF]">
                      <div className="flex items-center gap-1.5 font-medium text-xs">
                        <Clock className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        {appt.time}
                      </div>
                      {appt.created_at && (
                        <div className="text-[10px] text-[#71829F] mt-1">
                          Booked: {new Date(appt.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    {/* Reason / Message */}
                    <td className="py-4 px-5 align-top max-w-xs">
                      <p className="text-[#A3B3CF] line-clamp-2 text-xs leading-relaxed" title={appt.reason}>
                        {appt.reason || <span className="italic text-[#71829F]">No reason provided</span>}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 align-top">
                      {renderStatusBadge(appt.status)}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-5 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {appt.status !== 'confirmed' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'confirmed' })}
                            className="p-1.5 rounded-lg bg-[#10D6A0]/10 text-[#10D6A0] hover:bg-[#10D6A0]/20 border border-[#10D6A0]/30 transition-colors"
                            title="Confirm Appointment"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ id: appt.id, status: 'cancelled' })}
                            className="p-1.5 rounded-lg bg-[#FB7185]/10 text-[#FB7185] hover:bg-[#FB7185]/20 border border-[#FB7185]/30 transition-colors"
                            title="Cancel Appointment"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete appointment for ${appt.name}?`)) {
                              deleteMutation.mutate(appt.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#101D39] text-[#71829F] hover:text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors border border-transparent hover:border-[#FB7185]/20"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
