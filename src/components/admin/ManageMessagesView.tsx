import React, { useState } from 'react';
import { ContactMessage } from '../../types/portfolio.js';
import {
  Search,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Clock,
  ExternalLink,
  X,
  AlertCircle,
  CheckCircle2,
  Send
} from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageMessagesViewProps {
  messages: ContactMessage[];
  onRefresh: () => Promise<void>;
}

export const ManageMessagesView: React.FC<ManageMessagesViewProps> = ({ messages, onRefresh }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filtered = messages.filter((m) => {
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (id: string, status: 'unread' | 'read' | 'archived') => {
    try {
      const res = await authFetch(`/api/admin/messages/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update message status');
      await onRefresh();
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      const res = await authFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete message');
      await onRefresh();
      if (selectedMessage?.id === id) setSelectedMessage(null);
      setFeedback({ type: 'success', message: 'Message permanently removed.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenDetail = (m: ContactMessage) => {
    setSelectedMessage(m);
    if (m.status === 'unread') {
      // Mark as read automatically when opened
      handleUpdateStatus(m.id, 'read');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sender, email, subject..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64 sm:w-80"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({messages.length})
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterStatus === 'unread' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Unread ({messages.filter((m) => m.status === 'unread').length})
            </button>
            <button
              onClick={() => setFilterStatus('read')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterStatus === 'read' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Read ({messages.filter((m) => m.status === 'read').length})
            </button>
            <button
              onClick={() => setFilterStatus('archived')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterStatus === 'archived' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Archived ({messages.filter((m) => m.status === 'archived').length})
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-xs sm:text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Messages List Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1017] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            No contact inquiries found matching the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenDetail(msg)}
                className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  msg.status === 'unread'
                    ? 'bg-indigo-950/20 hover:bg-indigo-950/30'
                    : 'hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Status icon indicator */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 shrink-0 mt-0.5 sm:mt-0">
                    {msg.status === 'unread' ? (
                      <Mail className="w-4 h-4 text-rose-400 animate-pulse" />
                    ) : msg.status === 'archived' ? (
                      <Archive className="w-4 h-4 text-slate-500" />
                    ) : (
                      <MailOpen className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-sm font-semibold tracking-tight ${msg.status === 'unread' ? 'text-white font-bold' : 'text-slate-200'}`}>
                        {msg.subject}
                      </span>
                      {msg.status === 'unread' && (
                        <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-white font-medium">{msg.name}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-400">{msg.email}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 pt-1 max-w-2xl">
                      {msg.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleUpdateStatus(msg.id, msg.status === 'unread' ? 'read' : 'unread')}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                    >
                      {msg.status === 'unread' ? <MailOpen className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(msg.id, msg.status === 'archived' ? 'read' : 'archived')}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                      title={msg.status === 'archived' ? 'Unarchive' : 'Archive'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-[#0d0f16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d0f16]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-indigo-400">Inquiry Dossier</span>
                <span className="text-[11px] font-mono text-slate-500">ID: {selectedMessage.id}</span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedMessage.subject}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-2 font-mono">
                  <span>From: <strong className="text-white">{selectedMessage.name}</strong></span>
                  <span>·</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-indigo-400 hover:underline">
                    {selectedMessage.email}
                  </a>
                  <span>·</span>
                  <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  {selectedMessage.ipAddress && (
                    <>
                      <span>·</span>
                      <span className="text-slate-600">IP: {selectedMessage.ipAddress}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Message Content Container */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply via Email Client</span>
                  </a>

                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, selectedMessage.status === 'unread' ? 'read' : 'unread')}
                    className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {selectedMessage.status === 'unread' ? 'Mark Read' : 'Mark Unread'}
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, selectedMessage.status === 'archived' ? 'read' : 'archived')}
                    className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {selectedMessage.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
