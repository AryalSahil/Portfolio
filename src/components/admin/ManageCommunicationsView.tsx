import React, { useState } from 'react';
import { NotificationSettings, NewsletterSubscriber } from '../../types/portfolio.js';
import { Bell, Mail, Trash2, CheckCircle2, AlertCircle, Save, Loader2, Download, UserPlus, ShieldCheck } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageCommunicationsViewProps {
  notifications: NotificationSettings;
  subscribers: NewsletterSubscriber[];
  activeSubTab?: 'notifications' | 'newsletter';
  onRefresh: () => Promise<void>;
}

export const ManageCommunicationsView: React.FC<ManageCommunicationsViewProps> = ({
  notifications,
  subscribers,
  activeSubTab = 'notifications',
  onRefresh,
}) => {
  const [tab, setTab] = useState<'notifications' | 'newsletter'>(activeSubTab);
  const [notifState, setNotifState] = useState<NotificationSettings>(notifications);
  const [subscriberList, setSubscriberList] = useState<NewsletterSubscriber[]>(subscribers || []);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newEmail, setNewEmail] = useState('');

  React.useEffect(() => {
    if (notifications) setNotifState(notifications);
    if (subscribers) setSubscriberList(subscribers);
  }, [notifications, subscribers]);

  React.useEffect(() => {
    setTab(activeSubTab);
  }, [activeSubTab]);

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await authFetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifState),
      });
      if (!res.ok) throw new Error('Failed to save notification settings');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Notification preferences saved successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving notifications' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!window.confirm(`Remove subscriber "${email}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete subscriber');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Subscriber removed.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting subscriber' });
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail }),
      });
      if (!res.ok) throw new Error('Failed to register subscriber');
      setNewEmail('');
      await onRefresh();
      setFeedback({ type: 'success', message: 'New subscriber registered.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error adding subscriber' });
    }
  };

  const handleExportCsv = () => {
    const headers = 'ID,Email,SubscribedAt,Status\n';
    const rows = subscriberList
      .map((s) => `"${s.id}","${s.email}","${s.subscribedAt}","${s.status}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Subtab navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
        <button
          onClick={() => setTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notification Settings</span>
        </button>
        <button
          onClick={() => setTab('newsletter')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            tab === 'newsletter'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Newsletter Subscribers ({subscriberList.length})</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Notifications Tab */}
      {tab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Administrative Alert Channels</h3>
              <p className="text-xs text-slate-400 mt-1">Configure automated real-time dispatching for visitor events</p>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifState.emailAlerts}
                  onChange={(e) => setNotifState({ ...notifState, emailAlerts: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-white">Enable Automated Email Alerts</span>
                  <p className="text-[11px] text-slate-400">Master toggle for sending administrative event emails.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifState.notifyOnNewMessage}
                  onChange={(e) => setNotifState({ ...notifState, notifyOnNewMessage: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-white">New Contact Form Inquiries</span>
                  <p className="text-[11px] text-slate-400">Receive instant alert when a visitor submits the contact form.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifState.notifyOnResumeDownload}
                  onChange={(e) => setNotifState({ ...notifState, notifyOnResumeDownload: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-white">Curriculum Vitae Downloads</span>
                  <p className="text-[11px] text-slate-400">Notify admin when an executive or recruiter downloads your CV.</p>
                </div>
              </label>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Recipient Dispatch Email *</label>
                <input
                  type="email"
                  value={notifState.notificationEmail || ''}
                  onChange={(e) => setNotifState({ ...notifState, notificationEmail: e.target.value })}
                  placeholder="admin@studio-aetheria.dev"
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Notification Preferences</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Newsletter Tab */}
      {tab === 'newsletter' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Newsletter & Monograph Distribution</h3>
              <p className="text-xs text-slate-400">Audience members subscribed to technical publication updates</p>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={subscriberList.length === 0}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Quick Add Subscriber Form */}
          <form onSubmit={handleAddSubscriber} className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter subscriber email address..."
              required
              className="flex-1 px-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Subscriber</span>
            </button>
          </form>

          {/* Subscribers Table */}
          <div className="border border-slate-800 rounded-2xl bg-[#0e1017] overflow-hidden">
            {subscriberList.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs font-mono">
                No active subscribers recorded yet.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-mono">
                    <th className="py-3 px-4">Subscriber Email</th>
                    <th className="py-3 px-4">Subscribed Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {subscriberList.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4 font-mono text-white font-medium">{sub.email}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSubscriber(sub.id, sub.email)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remove Subscriber"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
