import React from 'react';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import { AdminProfile } from '../../types/portfolio.js';

interface AdminTopNavProps {
  title: string;
  subtitle: string;
  profile: AdminProfile;
  onOpenMobileSidebar: () => void;
  onPreviewSite: () => void;
  hasUnsavedChanges?: boolean;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  title,
  subtitle,
  profile,
  onOpenMobileSidebar,
  onPreviewSite,
  hasUnsavedChanges,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#090b10]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {hasUnsavedChanges && (
              <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                Unsaved Edits
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onPreviewSite}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700/80 hover:border-slate-500 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>View Live Site</span>
        </button>

        {/* Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{profile.name}</div>
            <div className="text-[10px] text-indigo-400/80 font-mono">{profile.role || 'Super Admin'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
