import React from 'react';
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  Award,
  MessageSquare,
  Share2,
  Sliders,
  Image,
  Settings,
  Shield,
  FileText,
  Layers,
  ExternalLink,
  LogOut,
  X
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'home'
  | 'about'
  | 'work'
  | 'skills'
  | 'messages'
  | 'social'
  | 'header-footer'
  | 'media'
  | 'settings'
  | 'security'
  | 'logs'
  | 'modular';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  unreadCount: number;
  onLogout: () => void;
  onPreviewSite: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount,
  onLogout,
  onPreviewSite,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'home', label: 'Manage Home', icon: <Home className="w-4 h-4" /> },
    { id: 'about', label: 'Manage About', icon: <User className="w-4 h-4" /> },
    { id: 'work', label: 'Manage Work / Projects', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'skills', label: 'Manage Skills', icon: <Award className="w-4 h-4" /> },
    {
      id: 'messages',
      label: 'Contact Inquiries',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'social', label: 'Manage Social Links', icon: <Share2 className="w-4 h-4" /> },
    { id: 'header-footer', label: 'Header & Footer', icon: <Sliders className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <Image className="w-4 h-4" /> },
    { id: 'settings', label: 'Website Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'modular', label: 'Modular Sections', icon: <Layers className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Profile', icon: <Shield className="w-4 h-4" /> },
    { id: 'logs', label: 'Audit Activity Logs', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090b10] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Top Title */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Studio CMS</div>
              <div className="text-[10px] text-slate-500 font-mono">Portfolio Control Center</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={onPreviewSite}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preview Live Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
