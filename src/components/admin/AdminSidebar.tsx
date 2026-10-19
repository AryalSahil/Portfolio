import React, { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  Award,
  GraduationCap,
  History,
  ShieldCheck,
  Trophy,
  Zap,
  FileText,
  BookOpen,
  MessageSquare,
  BarChart2,
  HelpCircle,
  Share2,
  Sliders,
  Image,
  Globe,
  Palette,
  ExternalLink,
  Layers,
  FileCode,
  Bell,
  Mail,
  Wrench,
  Shield,
  Activity,
  LineChart,
  HardDrive,
  Cpu,
  LogOut,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  // Content Management
  | 'home'
  | 'about'
  | 'skills'
  | 'work'
  | 'education'
  | 'experience'
  | 'certifications'
  | 'achievements'
  | 'services'
  | 'resume'
  | 'blog'
  | 'testimonials'
  | 'statistics'
  | 'faq'
  // Website Customization
  | 'social'
  | 'header-footer'
  | 'media'
  | 'seo'
  | 'theme'
  | 'preview'
  | 'drafts'
  | 'custom-pages'
  // Communication
  | 'messages'
  | 'notifications'
  | 'newsletter'
  // Settings & Security
  | 'maintenance'
  | 'security'
  | 'logs'
  | 'analytics'
  | 'resume-analytics'
  | 'performance'
  | 'database'
  | 'modular';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  unreadCount: number;
  subscribersCount?: number;
  onLogout: () => void;
  onPreviewSite: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavCategory {
  title: string;
  items: Array<{
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount,
  subscribersCount = 0,
  onLogout,
  onPreviewSite,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (title: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const categories: NavCategory[] = [
    {
      title: 'Content Management',
      items: [
        { id: 'home', label: 'Home / Hero', icon: <Home className="w-4 h-4" /> },
        { id: 'about', label: 'About Section', icon: <User className="w-4 h-4" /> },
        { id: 'skills', label: 'Skills & Tech', icon: <Cpu className="w-4 h-4" /> },
        { id: 'work', label: 'Projects / Work', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'experience', label: 'Experience & History', icon: <History className="w-4 h-4" /> },
        { id: 'certifications', label: 'Certifications', icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'achievements', label: 'Achievements & Awards', icon: <Trophy className="w-4 h-4" /> },
        { id: 'services', label: 'Services & Advisory', icon: <Zap className="w-4 h-4" /> },
        { id: 'resume', label: 'Resume / CV File', icon: <FileText className="w-4 h-4" /> },
        { id: 'blog', label: 'Blog & Articles', icon: <BookOpen className="w-4 h-4" /> },
        { id: 'testimonials', label: 'Testimonials', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'statistics', label: 'Website Statistics', icon: <BarChart2 className="w-4 h-4" /> },
        { id: 'faq', label: 'FAQ Management', icon: <HelpCircle className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Website Customization',
      items: [
        { id: 'social', label: 'Social Links', icon: <Share2 className="w-4 h-4" /> },
        { id: 'header-footer', label: 'Header & Navigation', icon: <Sliders className="w-4 h-4" /> },
        { id: 'media', label: 'Media Library', icon: <Image className="w-4 h-4" /> },
        { id: 'seo', label: 'SEO & Metadata', icon: <Globe className="w-4 h-4" /> },
        { id: 'theme', label: 'Theme & Appearance', icon: <Palette className="w-4 h-4" /> },
        { id: 'preview', label: 'Website Preview', icon: <ExternalLink className="w-4 h-4" /> },
        { id: 'drafts', label: 'Drafts & Publishing', icon: <Layers className="w-4 h-4" /> },
        { id: 'modular', label: 'Section Registry', icon: <Sliders className="w-4 h-4" /> },
        { id: 'custom-pages', label: 'Custom Pages', icon: <FileCode className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Communication',
      items: [
        {
          id: 'messages',
          label: 'Contact Messages',
          icon: <MessageSquare className="w-4 h-4" />,
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        { id: 'notifications', label: 'Message Notifications', icon: <Bell className="w-4 h-4" /> },
        {
          id: 'newsletter',
          label: 'Newsletter Subscribers',
          icon: <Mail className="w-4 h-4" />,
          badge: subscribersCount > 0 ? subscribersCount : undefined,
        },
      ],
    },
    {
      title: 'Settings & Security',
      items: [
        { id: 'maintenance', label: 'Maintenance Mode', icon: <Wrench className="w-4 h-4" /> },
        { id: 'security', label: 'Admin Profile & Security', icon: <Shield className="w-4 h-4" /> },
        { id: 'logs', label: 'Activity Logs', icon: <FileText className="w-4 h-4" /> },
        { id: 'analytics', label: 'Website Analytics', icon: <LineChart className="w-4 h-4" /> },
        { id: 'resume-analytics', label: 'Resume Downloads', icon: <Activity className="w-4 h-4" /> },
        { id: 'performance', label: 'Website Performance', icon: <Activity className="w-4 h-4" /> },
        { id: 'database', label: 'Database & Backup', icon: <HardDrive className="w-4 h-4" /> },
      ],
    },
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
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
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

        {/* Dashboard Shortcut */}
        <div className="px-3 pt-3 shrink-0">
          <button
            onClick={() => {
              onSelectTab('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4" />
              <span>Executive Dashboard</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-300">Overview</span>
          </button>
        </div>

        {/* Categorized Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {categories.map((cat) => {
            const isCollapsed = collapsedCategories[cat.title];
            return (
              <div key={cat.title} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.title)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <span>{cat.title}</span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-slate-600" />
                  )}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {cat.items.map((item) => {
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelectTab(item.id);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600/90 text-white shadow-sm font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className={isActive ? 'text-white' : 'text-slate-400'}>
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge !== undefined && (
                            <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-full bg-rose-500 text-white shrink-0 ml-1">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 shrink-0">
          <button
            onClick={onPreviewSite}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preview Live Website</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>End Session (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
