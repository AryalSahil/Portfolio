import React, { useState, useEffect } from 'react';
import { AdminProfile, PortfolioData, HomeContent, AboutContent, WebsiteSettings, HeaderFooterConfig, ModularSection } from '../../types/portfolio.js';
import { AdminSidebar, AdminTab } from './AdminSidebar.js';
import { AdminTopNav } from './AdminTopNav.js';
import { DashboardView } from './DashboardView.js';
import { ManageHomeView } from './ManageHomeView.js';
import { ManageAboutView } from './ManageAboutView.js';
import { ManageWorkView } from './ManageWorkView.js';
import { ManageSkillsView } from './ManageSkillsView.js';
import { ManageMessagesView } from './ManageMessagesView.js';
import { ManageSocialView } from './ManageSocialView.js';
import { ManageHeaderFooterView } from './ManageHeaderFooterView.js';
import { MediaLibraryView } from './MediaLibraryView.js';
import { WebsiteSettingsView } from './WebsiteSettingsView.js';
import { AdminSecurityView } from './AdminSecurityView.js';
import { ActivityLogsView } from './ActivityLogsView.js';
import { Loader2, X } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface AdminPanelProps {
  initialProfile: AdminProfile;
  onLogout: () => void;
  onPreviewSite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ initialProfile, onLogout, onPreviewSite }) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [profile, setProfile] = useState<AdminProfile>(initialProfile);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);
  const [onMediaSelectedCallback, setOnMediaSelectedCallback] = useState<((url: string) => void) | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await authFetch('/api/admin/all-data');
      if (res.status === 401) {
        onLogout();
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSaveHome = async (home: HomeContent) => {
    const res = await authFetch('/api/admin/home', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home }),
    });
    if (!res.ok) throw new Error('Failed to update Home section');
    await fetchAdminData();
  };

  const handleSaveAbout = async (about: AboutContent) => {
    const res = await authFetch('/api/admin/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ about }),
    });
    if (!res.ok) throw new Error('Failed to update About section');
    await fetchAdminData();
  };

  const handleSaveSettings = async (settings: WebsiteSettings) => {
    const res = await authFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    if (!res.ok) throw new Error('Failed to update website settings');
    await fetchAdminData();
  };

  const handleSaveHeaderFooter = async (headerFooter: HeaderFooterConfig) => {
    const res = await authFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headerFooter }),
    });
    if (!res.ok) throw new Error('Failed to update header & footer');
    await fetchAdminData();
  };

  const handleSaveModularSections = async (sections: ModularSection[]) => {
    const res = await authFetch('/api/admin/modular-sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections }),
    });
    if (!res.ok) throw new Error('Failed to update modular sections');
    await fetchAdminData();
  };

  const handleUpdateProfile = async (updates: Partial<AdminProfile>) => {
    const res = await authFetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update admin profile');
    setProfile(result.profile);
    await fetchAdminData();
  };

  const openMediaPicker = (cb: (url: string) => void) => {
    setOnMediaSelectedCallback(() => cb);
    setShowMediaPicker(true);
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest">Loading Studio Database...</span>
        </div>
      </div>
    );
  }

  const unreadMessagesCount = (data.contactMessages || []).filter((m) => m.status === 'unread').length;

  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'dashboard': return { title: 'Dashboard', subtitle: 'Overview of operations, recent activity, and platform metrics' };
      case 'home': return { title: 'Manage Home', subtitle: 'Hero section typography, introduction, and calls to action' };
      case 'about': return { title: 'Manage About', subtitle: 'Biography, workspace media, education, and career milestones' };
      case 'work': return { title: 'Manage Work & Projects', subtitle: 'Project portfolio cards, case study details, and code repositories' };
      case 'skills': return { title: 'Manage Skills', subtitle: 'Technical proficiencies, stacks, and categorization' };
      case 'messages': return { title: 'Contact Inquiries', subtitle: 'Incoming messages from portfolio visitors' };
      case 'social': return { title: 'Manage Social Links', subtitle: 'Outbound profiles and contact platforms' };
      case 'header-footer': return { title: 'Header & Footer', subtitle: 'Navigation architecture and global site footer' };
      case 'media': return { title: 'Media Library', subtitle: 'Central visual assets, images, and documents' };
      case 'settings': return { title: 'Website Settings & Expansion', subtitle: 'SEO metadata, primary themes, and maintenance mode' };
      case 'modular': return { title: 'Modular Section Registry', subtitle: 'Configure future section additions without rebuilding code' };
      case 'security': return { title: 'Profile & Security', subtitle: 'Administrator credentials and password updates' };
      case 'logs': return { title: 'Audit Activity Logs', subtitle: 'Verifiable security audit trail of all changes' };
      default: return { title: 'Admin Console', subtitle: 'Manage portfolio website' };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <div className="min-h-screen bg-[#07080c] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadCount={unreadMessagesCount}
        onLogout={onLogout}
        onPreviewSite={onPreviewSite}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <AdminTopNav
          title={title}
          subtitle={subtitle}
          profile={profile}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onPreviewSite={onPreviewSite}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              metrics={{
                totalProjects: data.projects.length,
                publishedProjects: data.projects.filter((p) => p.isPublished).length,
                draftProjects: data.projects.filter((p) => !p.isPublished).length,
                totalMessages: data.contactMessages.length,
                unreadMessages: unreadMessagesCount,
                mediaCount: data.mediaLibrary.length,
              }}
              recentActivities={data.activityLogs || []}
              onNavigateTab={setCurrentTab}
              onPreviewSite={onPreviewSite}
            />
          )}

          {currentTab === 'home' && (
            <ManageHomeView
              initialData={data.home}
              onSave={handleSaveHome}
              onOpenMediaLibrary={() => openMediaPicker((url) => {
                setData((prev) => prev ? { ...prev, home: { ...prev.home, profilePhotoUrl: url } } : prev);
              })}
            />
          )}

          {currentTab === 'about' && (
            <ManageAboutView
              initialData={data.about}
              onSave={handleSaveAbout}
              onOpenMediaLibrary={() => openMediaPicker((url) => {
                setData((prev) => prev ? { ...prev, about: { ...prev.about, profilePhotoUrl: url } } : prev);
              })}
            />
          )}

          {currentTab === 'work' && (
            <ManageWorkView
              projects={data.projects}
              onRefresh={fetchAdminData}
              onOpenMediaLibrary={() => openMediaPicker(() => {})}
            />
          )}

          {currentTab === 'skills' && (
            <ManageSkillsView
              skills={data.skills}
              onRefresh={fetchAdminData}
            />
          )}

          {currentTab === 'messages' && (
            <ManageMessagesView
              messages={data.contactMessages}
              onRefresh={fetchAdminData}
            />
          )}

          {currentTab === 'social' && (
            <ManageSocialView
              socialLinks={data.socialLinks}
              onRefresh={fetchAdminData}
            />
          )}

          {currentTab === 'header-footer' && (
            <ManageHeaderFooterView
              initialConfig={data.headerFooter}
              onSave={handleSaveHeaderFooter}
            />
          )}

          {currentTab === 'media' && (
            <MediaLibraryView
              media={data.mediaLibrary}
              onRefresh={fetchAdminData}
            />
          )}

          {(currentTab === 'settings' || currentTab === 'modular') && (
            <WebsiteSettingsView
              initialSettings={data.settings}
              modularSections={data.modularSections || []}
              onSaveSettings={handleSaveSettings}
              onSaveModularSections={handleSaveModularSections}
            />
          )}

          {currentTab === 'security' && (
            <AdminSecurityView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentTab === 'logs' && (
            <ActivityLogsView
              logs={data.activityLogs || []}
            />
          )}
        </main>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[85vh] bg-[#0e1017] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-tight">Select Asset from Media Library</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <MediaLibraryView
                media={data.mediaLibrary}
                onRefresh={fetchAdminData}
                onSelectUrl={(url) => {
                  if (onMediaSelectedCallback) onMediaSelectedCallback(url);
                  setShowMediaPicker(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
