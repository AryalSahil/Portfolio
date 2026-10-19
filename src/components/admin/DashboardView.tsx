import React from 'react';
import {
  Briefcase,
  CheckCircle2,
  FileEdit,
  MessageSquare,
  AlertCircle,
  Image,
  Plus,
  ArrowRight,
  ExternalLink,
  Clock,
  Sparkles
} from 'lucide-react';
import { AdminTab } from './AdminSidebar.js';
import { ActivityLog } from '../../types/portfolio.js';

interface DashboardViewProps {
  metrics: {
    totalProjects: number;
    publishedProjects: number;
    draftProjects: number;
    totalMessages: number;
    unreadMessages: number;
    mediaCount: number;
  };
  recentActivities: ActivityLog[];
  onNavigateTab: (tab: AdminTab) => void;
  onPreviewSite: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  recentActivities,
  onNavigateTab,
  onPreviewSite,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner / Welcome */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Operational Status: Live & Synced</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Portfolio Administration Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Real-time persistence layer active. All edits made in this console update the database immediately and reflect across the public portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('work')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Project</span>
          </button>
          <button
            onClick={onPreviewSite}
            className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:border-slate-500 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Launch Live Preview</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Projects */}
        <div
          onClick={() => onNavigateTab('work')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Total Work</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {metrics.totalProjects}
          </div>
          <div className="text-[11px] text-slate-500">Case studies in DB</div>
        </div>

        {/* Published Projects */}
        <div
          onClick={() => onNavigateTab('work')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {metrics.publishedProjects}
          </div>
          <div className="text-[11px] text-slate-500">Visible on public site</div>
        </div>

        {/* Draft Projects */}
        <div
          onClick={() => onNavigateTab('work')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-amber-500/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Drafts</span>
            <FileEdit className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
            {metrics.draftProjects}
          </div>
          <div className="text-[11px] text-slate-500">Private work-in-progress</div>
        </div>

        {/* Total Inquiries */}
        <div
          onClick={() => onNavigateTab('messages')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-sky-500/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Messages</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {metrics.totalMessages}
          </div>
          <div className="text-[11px] text-slate-500">Total inquiries logged</div>
        </div>

        {/* Unread Inquiries */}
        <div
          onClick={() => onNavigateTab('messages')}
          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
            metrics.unreadMessages > 0
              ? 'border-rose-500/50 bg-rose-950/20 hover:bg-rose-950/30'
              : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/80'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Unread</span>
            <AlertCircle className={`w-4 h-4 ${metrics.unreadMessages > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl sm:text-3xl font-extrabold font-mono tabular-nums ${metrics.unreadMessages > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
            {metrics.unreadMessages}
          </div>
          <div className="text-[11px] text-slate-500">Awaiting your response</div>
        </div>

        {/* Media Assets */}
        <div
          onClick={() => onNavigateTab('media')}
          className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase">Media</span>
            <Image className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {metrics.mediaCount}
          </div>
          <div className="text-[11px] text-slate-500">Uploaded assets</div>
        </div>
      </div>

      {/* Quick Action Shortcuts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => onNavigateTab('home')}
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white tracking-tight">Edit Hero & Bio</div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Update your professional title, introduction, profile photo, and call-to-action buttons.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('skills')}
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white tracking-tight">Manage Skills & Stack</div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Reorder, add new technical disciplines, and calibrate proficiency percentages.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('seo')}
          className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white tracking-tight">Website Settings & SEO</div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tune metadata descriptions, toggle maintenance mode, and manage future modular expansions.
          </p>
        </div>
      </div>

      {/* Real Audit Activity Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">Recent Administrative Activities</h3>
            <p className="text-xs text-slate-400">Cryptographically verifiable audit log of changes made to the database</p>
          </div>
          <button
            onClick={() => onNavigateTab('logs')}
            className="text-xs font-mono text-indigo-400 hover:underline cursor-pointer"
          >
            View all logs →
          </button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No recent administrative activities recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/70">
              {recentActivities.slice(0, 6).map((log) => (
                <div key={log.id} className="p-3.5 sm:px-5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-white">{log.action}</span>
                      <span className="text-[11px] text-indigo-400 font-mono">by {log.adminName}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xl">{log.details}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px] shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
