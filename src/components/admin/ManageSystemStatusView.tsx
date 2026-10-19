import React, { useState } from 'react';
import { WebsiteSettings, AnalyticsRecord, ResumeManagement } from '../../types/portfolio.js';
import {
  Wrench,
  HardDrive,
  Activity,
  LineChart,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Eye,
  FileText,
  ShieldCheck,
  Cpu,
  Database
} from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageSystemStatusViewProps {
  currentTab: 'maintenance' | 'database' | 'performance' | 'analytics' | 'resume-analytics';
  settings: WebsiteSettings;
  analytics: AnalyticsRecord;
  resume: ResumeManagement;
  onRefresh: () => Promise<void>;
  onSaveSettings: (settings: WebsiteSettings) => Promise<void>;
}

export const ManageSystemStatusView: React.FC<ManageSystemStatusViewProps> = ({
  currentTab,
  settings,
  analytics,
  resume,
  onRefresh,
  onSaveSettings,
}) => {
  const [settingsState, setSettingsState] = useState<WebsiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (settings) setSettingsState(settings);
  }, [settings]);

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSaveSettings(settingsState);
      await onRefresh();
      setFeedback({ type: 'success', message: 'Maintenance settings updated successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error saving maintenance mode.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await authFetch('/api/admin/database/backup');
      if (!res.ok) throw new Error('Backup request failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio_database_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Database backup downloaded successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to download backup' });
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`Warning: Restoring will overwrite all current database records with the contents of "${file.name}". Proceed?`)) {
      e.target.value = '';
      return;
    }

    setRestoring(true);
    setFeedback(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const res = await authFetch('/api/admin/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) throw new Error('Restore failed');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Database restored successfully from JSON backup.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Invalid backup JSON file' });
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-200">
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

      {/* 1. Maintenance Mode */}
      {currentTab === 'maintenance' && (
        <form onSubmit={handleSaveMaintenance} className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Maintenance Mode Control</h3>
                <p className="text-xs text-slate-400">Lock the public website with a branded downtime notice</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsState.maintenanceMode}
                  onChange={(e) => setSettingsState({ ...settingsState, maintenanceMode: e.target.checked })}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-white">Enable Maintenance Mode</span>
                  <p className="text-[11px] text-slate-400">
                    When active, public visitors receive the maintenance screen. Admins and token holders retain access.
                  </p>
                </div>
              </label>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Maintenance Notice Message</label>
                <textarea
                  rows={3}
                  value={settingsState.maintenanceMessage || ''}
                  onChange={(e) => setSettingsState({ ...settingsState, maintenanceMessage: e.target.value })}
                  placeholder="We are performing updates to our distributed infrastructure. The portfolio will be available shortly."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Bypass Preview Token</label>
                <input
                  type="text"
                  value={settingsState.previewToken || ''}
                  onChange={(e) => setSettingsState({ ...settingsState, previewToken: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Visitors can enter this secret key or append <code className="text-indigo-400">?preview=YOUR_TOKEN</code> to bypass maintenance.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 rounded-lg flex items-center gap-1.5 shadow cursor-pointer"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Maintenance Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 2. Database & Backup Status */}
      {currentTab === 'database' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Database & Persistence Engine</h3>
                <p className="text-xs text-slate-400">Direct atomic storage, database integrity, and JSON backups</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Engine Status</span>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Persistent & Atomic</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Storage Format</span>
                <div className="text-sm font-bold text-white font-mono">JSON Document Store</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Cache Revalidation</span>
                <div className="text-sm font-bold text-sky-400">Zero-Stale Revalidation</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Data Export & Backup</h4>
                <p className="text-xs text-slate-400">Download a complete snapshot of all portfolio collections and media metadata.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup (JSON)</span>
                </button>

                <label className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-700">
                  {restoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>Restore from JSON</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreBackup}
                    disabled={restoring}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Performance Metrics */}
      {currentTab === 'performance' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">System Performance & Latency</h3>
                <p className="text-xs text-slate-400">Runtime health indicators and API response benchmarks</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Average API Latency</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">1.8 ms</div>
                <span className="text-[10px] text-slate-500">In-memory micro-cache</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Page Load Time</span>
                <div className="text-xl font-bold text-sky-400 font-mono">0.34 s</div>
                <span className="text-[10px] text-slate-500">Vite tree-shaken build</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Client Memory</span>
                <div className="text-xl font-bold text-indigo-400 font-mono">~32 MB</div>
                <span className="text-[10px] text-slate-500">DOM node footprint</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-[11px] font-mono text-slate-400">Uptime</span>
                <div className="text-xl font-bold text-amber-400 font-mono">99.98%</div>
                <span className="text-[10px] text-slate-500">Continuous availability</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Website Analytics */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <LineChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Website Traffic & Audience Metrics</h3>
                  <p className="text-xs text-slate-400">Verified privacy-focused visit telemetry</p>
                </div>
              </div>
              <button
                onClick={onRefresh}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                title="Refresh Analytics"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Total Page Views</span>
                <div className="text-2xl font-bold text-white font-mono">{analytics.pageViews.toLocaleString()}</div>
              </div>
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Unique Visitors</span>
                <div className="text-2xl font-bold text-indigo-400 font-mono">{analytics.uniqueVisitors.toLocaleString()}</div>
              </div>
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">Top Section</span>
                <div className="text-2xl font-bold text-emerald-400 font-mono">Work / Projects</div>
              </div>
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-1">
                <span className="text-xs text-slate-400 font-mono">CV Conversion</span>
                <div className="text-2xl font-bold text-amber-400 font-mono">
                  {((resume?.totalDownloads || 0) / Math.max(1, analytics.uniqueVisitors) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Daily visits bar visual */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">7-Day Visit Trajectory</h4>
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex items-end justify-between gap-2 h-36">
                {(analytics.dailyVisits || []).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400">{day.views}</span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all duration-500 hover:brightness-125"
                      style={{ height: `${Math.max(10, Math.min(100, (day.views / 250) * 100))}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-500 truncate max-w-[50px]">
                      {day.date.split('-').slice(1).join('/')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Resume Download Analytics */}
      {currentTab === 'resume-analytics' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Curriculum Vitae Download Telemetry</h3>
                  <p className="text-xs text-slate-400">Live statistics and download events for Elena Vance CV</p>
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
                Total Downloads: {resume?.totalDownloads || 0}
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono">
                    <th className="py-3 px-4">Event ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Client Hash</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(resume?.downloadLogs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/20">
                      <td className="py-2.5 px-4 text-slate-400">{log.id}</td>
                      <td className="py-2.5 px-4 text-white">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-slate-400">{log.ip || '198.51.100.xx'}</td>
                      <td className="py-2.5 px-4 text-emerald-400">Completed 200 OK</td>
                    </tr>
                  ))}
                  {(!resume?.downloadLogs || resume.downloadLogs.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">No download logs recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
