import React, { useState, useEffect } from 'react';
import {
  AdminProfile,
  PortfolioData,
  HomeContent,
  AboutContent,
  WebsiteSettings,
  HeaderFooterConfig,
  ModularSection,
  ResumeManagement,
  SeoMetadata,
} from '../../types/portfolio.js';
import { AdminSidebar, AdminTab } from './AdminSidebar.js';
import { AdminTopNav } from './AdminTopNav.js';
import { DashboardView } from './DashboardView.js';
import { ManageHomeView } from './ManageHomeView.js';
import { ManageAboutView } from './ManageAboutView.js';
import { ManageWorkView } from './ManageWorkView.js';
import { ManageSkillsView } from './ManageSkillsView.js';
import { ManageEducationView } from './ManageEducationView.js';
import { ManageExperienceView } from './ManageExperienceView.js';
import { ManageCertificationsView } from './ManageCertificationsView.js';
import { ManageAchievementsView } from './ManageAchievementsView.js';
import { ManageServicesView } from './ManageServicesView.js';
import { ManageResumeView } from './ManageResumeView.js';
import { ManageBlogView } from './ManageBlogView.js';
import { ManageTestimonialsView } from './ManageTestimonialsView.js';
import { ManageStatisticsView } from './ManageStatisticsView.js';
import { ManageFaqView } from './ManageFaqView.js';
import { ManageSocialView } from './ManageSocialView.js';
import { ManageHeaderFooterView } from './ManageHeaderFooterView.js';
import { MediaLibraryView } from './MediaLibraryView.js';
import { ManageSeoView } from './ManageSeoView.js';
import { ManageThemeView } from './ManageThemeView.js';
import { ManageDraftsView } from './ManageDraftsView.js';
import { ManageCustomPagesView } from './ManageCustomPagesView.js';
import { ManageCommunicationsView } from './ManageCommunicationsView.js';
import { ManageSystemStatusView } from './ManageSystemStatusView.js';
import { WebsitePreviewView } from './WebsitePreviewView.js';
import { WebsiteSettingsView } from './WebsiteSettingsView.js';
import { ManageMessagesView } from './ManageMessagesView.js';
import { AdminSecurityView } from './AdminSecurityView.js';
import { ActivityLogsView } from './ActivityLogsView.js';
import { Loader2, X } from 'lucide-react';
import { authFetch, safeJsonResponse } from '../../utils/api.js';

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
      const parsed = await safeJsonResponse<PortfolioData>(res);
      if (parsed.ok && parsed.data) {
        setData(parsed.data);
      }
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

  const handleSaveResume = async (resume: ResumeManagement) => {
    const res = await authFetch('/api/admin/resume', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume }),
    });
    if (!res.ok) throw new Error('Failed to update Resume settings');
    await fetchAdminData();
  };

  const handleSaveSeo = async (seo: SeoMetadata) => {
    const res = await authFetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seoMetadata: seo }),
    });
    if (!res.ok) throw new Error('Failed to update SEO metadata');
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
      case 'skills': return { title: 'Manage Skills & Technologies', subtitle: 'Technical proficiencies, stacks, and categorization' };
      case 'work': return { title: 'Manage Projects / Portfolio', subtitle: 'Project portfolio cards, case study details, and code repositories' };
      case 'education': return { title: 'Manage Education', subtitle: 'Academic degrees, university honors, and coursework' };
      case 'experience': return { title: 'Manage Experience', subtitle: 'Career milestones, staff roles, and quantitative achievements' };
      case 'certifications': return { title: 'Manage Certifications', subtitle: 'Professional credentials, cloud badges, and issuer credentials' };
      case 'achievements': return { title: 'Manage Achievements & Awards', subtitle: 'Patents, architectural awards, and industry recognitions' };
      case 'services': return { title: 'Manage Services & Consulting', subtitle: 'Engineering advisory packages, architecture reviews, and rates' };
      case 'resume': return { title: 'Resume / CV Management', subtitle: 'Curriculum Vitae file uploads, download permissions, and logs' };
      case 'blog': return { title: 'Blog & Articles', subtitle: 'Engineering monographs, technical write-ups, and publishing' };
      case 'testimonials': return { title: 'Testimonials Management', subtitle: 'Executive peer reviews, client quotes, and ratings' };
      case 'statistics': return { title: 'Website Statistics', subtitle: 'Hero strip KPI numbers, years of experience, and scale metrics' };
      case 'faq': return { title: 'FAQ Management', subtitle: 'Frequently asked questions, categorized answers, and help desk' };
      case 'social': return { title: 'Social Links', subtitle: 'Outbound profiles, GitHub, LinkedIn, and social connectivity' };
      case 'header-footer': return { title: 'Header & Footer', subtitle: 'Navigation architecture and global footer copyright' };
      case 'media': return { title: 'Media Library', subtitle: 'Central image uploads, asset storage, and permanent URLs' };
      case 'seo': return { title: 'SEO & Metadata', subtitle: 'Search engine tags, OpenGraph previews, and indexing' };
      case 'theme': return { title: 'Theme & Appearance', subtitle: 'Primary branding colors, accents, and visual theme mode' };
      case 'preview': return { title: 'Website Preview', subtitle: 'Responsive viewport testing for desktop, tablet, and mobile' };
      case 'drafts': return { title: 'Drafts & Publishing Control', subtitle: 'Publish or conceal draft items across all collections' };
      case 'custom-pages': return { title: 'Custom Pages Management', subtitle: 'Dedicated custom pages, privacy policies, and documentation' };
      case 'messages': return { title: 'Contact Messages', subtitle: 'Incoming client inquiries and contact form submissions' };
      case 'notifications': return { title: 'Message Notifications', subtitle: 'Administrative alerts and email notification preferences' };
      case 'newsletter': return { title: 'Newsletter Subscribers', subtitle: 'Subscriber list, active registrations, and CSV export' };
      case 'maintenance': return { title: 'Maintenance Mode', subtitle: 'Scheduled downtime mode, public notice, and bypass tokens' };
      case 'security': return { title: 'Admin Profile & Security', subtitle: 'Password management and administrator profile' };
      case 'logs': return { title: 'Activity Logs', subtitle: 'Security audit trail of all administrative events' };
      case 'analytics': return { title: 'Website Analytics', subtitle: 'Visitor metrics, page views, and section performance' };
      case 'resume-analytics': return { title: 'Resume Download Analytics', subtitle: 'Download counters and candidate telemetry logs' };
      case 'performance': return { title: 'Website Performance', subtitle: 'API latency benchmarks, client memory, and system health' };
      case 'database': return { title: 'Database & Backup Status', subtitle: 'Persistent JSON database storage and full backup exports' };
      case 'modular': return { title: 'Section Visibility & Ordering', subtitle: 'Toggle public sections on or off without deleting data' };
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
        subscribersCount={data.newsletterSubscribers?.length || 0}
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
          {/* Dashboard */}
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

          {/* 1. Home / Hero Management */}
          {currentTab === 'home' && (
            <ManageHomeView
              initialData={data.home}
              onSave={handleSaveHome}
              onOpenMediaLibrary={() => openMediaPicker((url) => {
                setData((prev) => prev ? { ...prev, home: { ...prev.home, profilePhotoUrl: url } } : prev);
              })}
            />
          )}

          {/* 2. About Section Management */}
          {currentTab === 'about' && (
            <ManageAboutView
              initialData={data.about}
              onSave={handleSaveAbout}
              onOpenMediaLibrary={() => openMediaPicker((url) => {
                setData((prev) => prev ? { ...prev, about: { ...prev.about, profilePhotoUrl: url } } : prev);
              })}
            />
          )}

          {/* 3. Skills & Technologies */}
          {currentTab === 'skills' && (
            <ManageSkillsView
              skills={data.skills}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 4. Projects / Portfolio */}
          {currentTab === 'work' && (
            <ManageWorkView
              projects={data.projects}
              onRefresh={fetchAdminData}
              onOpenMediaLibrary={() => openMediaPicker(() => {})}
            />
          )}

          {/* 5. Education */}
          {currentTab === 'education' && (
            <ManageEducationView
              education={data.education}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 6. Experience */}
          {currentTab === 'experience' && (
            <ManageExperienceView
              experience={data.experience}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 7. Certifications */}
          {currentTab === 'certifications' && (
            <ManageCertificationsView
              certifications={data.certifications}
              onRefresh={fetchAdminData}
              onOpenMediaLibrary={() => openMediaPicker(() => {})}
            />
          )}

          {/* 8. Achievements & Awards */}
          {currentTab === 'achievements' && (
            <ManageAchievementsView
              achievements={data.achievements}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 9. Services */}
          {currentTab === 'services' && (
            <ManageServicesView
              services={data.services}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 10. Resume / CV Management */}
          {currentTab === 'resume' && (
            <ManageResumeView
              resume={data.resume}
              onSave={handleSaveResume}
              onOpenMediaLibrary={() => openMediaPicker((url) => {
                setData((prev) => prev ? { ...prev, resume: { ...prev.resume, url } } : prev);
              })}
            />
          )}

          {/* 11. Blog / Articles */}
          {currentTab === 'blog' && (
            <ManageBlogView
              posts={data.blog}
              onRefresh={fetchAdminData}
              onOpenMediaLibrary={() => openMediaPicker(() => {})}
            />
          )}

          {/* 12. Testimonials */}
          {currentTab === 'testimonials' && (
            <ManageTestimonialsView
              testimonials={data.testimonials}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 13. Website Statistics */}
          {currentTab === 'statistics' && (
            <ManageStatisticsView
              home={data.home}
              onSave={handleSaveHome}
            />
          )}

          {/* 14. FAQ Management */}
          {currentTab === 'faq' && (
            <ManageFaqView
              faq={data.faq}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 15. Social Links */}
          {currentTab === 'social' && (
            <ManageSocialView
              socialLinks={data.socialLinks}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 16. Header & Navigation / 17. Footer Management */}
          {currentTab === 'header-footer' && (
            <ManageHeaderFooterView
              initialConfig={data.headerFooter}
              onSave={handleSaveHeaderFooter}
            />
          )}

          {/* 18. Media Library */}
          {currentTab === 'media' && (
            <MediaLibraryView
              media={data.mediaLibrary}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 19. SEO & Metadata */}
          {currentTab === 'seo' && (
            <ManageSeoView
              seo={data.seoMetadata}
              onSave={handleSaveSeo}
              onOpenMediaLibrary={() => openMediaPicker((url) => {
                setData((prev) => prev ? { ...prev, seoMetadata: { ...prev.seoMetadata, ogImage: url } } : prev);
              })}
            />
          )}

          {/* 20. Theme & Appearance */}
          {currentTab === 'theme' && (
            <ManageThemeView
              settings={data.settings}
              onSave={handleSaveSettings}
            />
          )}

          {/* 21. Website Preview */}
          {currentTab === 'preview' && (
            <WebsitePreviewView
              onOpenPublicSite={onPreviewSite}
            />
          )}

          {/* 22. Drafts & Publishing */}
          {currentTab === 'drafts' && (
            <ManageDraftsView
              data={data}
              onRefresh={fetchAdminData}
              onPreviewSite={onPreviewSite}
            />
          )}

          {/* 23. Custom Pages Management */}
          {currentTab === 'custom-pages' && (
            <ManageCustomPagesView
              customPages={data.customPages || []}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 24. Contact Messages */}
          {currentTab === 'messages' && (
            <ManageMessagesView
              messages={data.contactMessages}
              onRefresh={fetchAdminData}
            />
          )}

          {/* 25. Message Notifications */}
          {currentTab === 'notifications' && (
            <ManageCommunicationsView
              notifications={data.notificationSettings}
              subscribers={data.newsletterSubscribers || []}
              activeSubTab="notifications"
              onRefresh={fetchAdminData}
            />
          )}

          {/* 26. Newsletter Subscribers */}
          {currentTab === 'newsletter' && (
            <ManageCommunicationsView
              notifications={data.notificationSettings}
              subscribers={data.newsletterSubscribers || []}
              activeSubTab="newsletter"
              onRefresh={fetchAdminData}
            />
          )}

          {/* 27. Maintenance Mode */}
          {currentTab === 'maintenance' && (
            <ManageSystemStatusView
              currentTab="maintenance"
              settings={data.settings}
              analytics={data.analytics}
              resume={data.resume}
              onRefresh={fetchAdminData}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {/* 28. Admin Profile & Security */}
          {currentTab === 'security' && (
            <AdminSecurityView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {/* 29. Activity Logs */}
          {currentTab === 'logs' && (
            <ActivityLogsView
              logs={data.activityLogs || []}
            />
          )}

          {/* 30. Website Analytics */}
          {currentTab === 'analytics' && (
            <ManageSystemStatusView
              currentTab="analytics"
              settings={data.settings}
              analytics={data.analytics}
              resume={data.resume}
              onRefresh={fetchAdminData}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {/* 31. Resume Download Analytics */}
          {currentTab === 'resume-analytics' && (
            <ManageSystemStatusView
              currentTab="resume-analytics"
              settings={data.settings}
              analytics={data.analytics}
              resume={data.resume}
              onRefresh={fetchAdminData}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {/* 32. Website Performance */}
          {currentTab === 'performance' && (
            <ManageSystemStatusView
              currentTab="performance"
              settings={data.settings}
              analytics={data.analytics}
              resume={data.resume}
              onRefresh={fetchAdminData}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {/* 33. Database & Backup Status */}
          {currentTab === 'database' && (
            <ManageSystemStatusView
              currentTab="database"
              settings={data.settings}
              analytics={data.analytics}
              resume={data.resume}
              onRefresh={fetchAdminData}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {/* Section Visibility & Ordering */}
          {currentTab === 'modular' && (
            <WebsiteSettingsView
              initialSettings={data.settings}
              modularSections={data.modularSections || []}
              onSaveSettings={handleSaveSettings}
              onSaveModularSections={handleSaveModularSections}
            />
          )}
        </main>
      </div>

      {/* Global Media Picker Modal */}
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
