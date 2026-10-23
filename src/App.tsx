/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PublicPortfolioData, AdminProfile } from './types/portfolio.js';
import { INITIAL_PUBLIC_PORTFOLIO } from './data/initialData.js';
import { Navbar } from './components/public/Navbar.js';
import { Hero } from './components/public/Hero.js';
import { About } from './components/public/About.js';
import { Work } from './components/public/Work.js';
import { Experience } from './components/public/Experience.js';
import { SkillsSection } from './components/public/SkillsSection.js';
import { ServicesSection } from './components/public/ServicesSection.js';
import { EducationSection } from './components/public/EducationSection.js';
import { Certifications } from './components/public/Certifications.js';
import { Achievements } from './components/public/Achievements.js';
import { ResumeSection } from './components/public/ResumeSection.js';
import { TestimonialsSection } from './components/public/TestimonialsSection.js';
import { BlogSection } from './components/public/BlogSection.js';
import { GithubSection } from './components/public/GithubSection.js';
import { FaqSection } from './components/public/FaqSection.js';
import { Contact } from './components/public/Contact.js';
import { Footer } from './components/public/Footer.js';
import { FutureSectionRenderer } from './components/public/FutureSectionRenderer.js';
import { AdminLogin } from './components/admin/AdminLogin.js';
import { AdminPanel } from './components/admin/AdminPanel.js';
import { Loader2, Wrench } from 'lucide-react';
import { authFetch, clearStoredSessionToken, safeJsonResponse } from './utils/api.js';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(
    window.location.pathname.startsWith('/admin')
  );
  const [adminAuth, setAdminAuth] = useState<{ checked: boolean; authenticated: boolean; profile: AdminProfile | null }>({
    checked: false,
    authenticated: false,
    profile: null,
  });

  const [portfolioData, setPortfolioData] = useState<PublicPortfolioData>(INITIAL_PUBLIC_PORTFOLIO);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [previewTokenInput, setPreviewTokenInput] = useState<string>('');

  // Synchronize browser history / URL path
  const navigateToAdmin = (target = '/admin') => {
    // Validate target is an internal authorized route
    const safeTarget = target.startsWith('/admin') && !target.includes('//') ? target : '/admin';
    window.history.pushState({}, '', safeTarget);
    setIsAdminRoute(true);
  };

  const navigateToPublic = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Verify Admin Session on Mount
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const res = await authFetch('/api/auth/check', {
          headers: { 'Accept': 'application/json' },
        });
        const parsed = await safeJsonResponse<{ authenticated: boolean; profile?: AdminProfile }>(res);
        if (parsed.ok && parsed.data?.authenticated && parsed.data?.profile) {
          setAdminAuth({ checked: true, authenticated: true, profile: parsed.data.profile });
        } else {
          clearStoredSessionToken();
          setAdminAuth({ checked: true, authenticated: false, profile: null });
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        clearStoredSessionToken();
        setAdminAuth({ checked: true, authenticated: false, profile: null });
      }
    };
    checkAdminSession();
  }, []);

  // 2. Fetch Public Portfolio Data
  const fetchPublicPortfolio = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const preview = urlParams.get('preview');
      const fetchUrl = preview ? `/api/portfolio?preview=${encodeURIComponent(preview)}` : '/api/portfolio';

      const res = await fetch(fetchUrl, {
        headers: { 'Accept': 'application/json' },
      });
      const parsed = await safeJsonResponse<PublicPortfolioData & { maintenance?: boolean }>(res);

      if (parsed.ok && parsed.data) {
        if (parsed.data.maintenance) {
          setMaintenanceMode(true);
        } else {
          setMaintenanceMode(false);
          setPortfolioData(parsed.data);
          if (parsed.data.seoMetadata?.metaTitle) {
            document.title = parsed.data.seoMetadata.metaTitle;
          } else if (parsed.data.settings?.siteTitle) {
            document.title = parsed.data.settings.siteTitle;
          }
        }
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  };

  useEffect(() => {
    if (!isAdminRoute) {
      fetchPublicPortfolio();
    }
  }, [isAdminRoute]);

  // 3. Scroll spy for active navbar section
  useEffect(() => {
    if (isAdminRoute) return;

    const sections = [
      'home',
      'about',
      'experience',
      'skills',
      'work',
      'services',
      'education',
      'certifications',
      'achievements',
      'resume',
      'testimonials',
      'blog',
      'github',
      'faq',
      'contact',
    ];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminRoute]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    clearStoredSessionToken();
    setAdminAuth({ checked: true, authenticated: false, profile: null });
  };

  // If currently in Admin view
  if (isAdminRoute) {
    if (!adminAuth.checked) {
      return (
        <div className="min-h-screen bg-[#07080c] flex items-center justify-center text-slate-400">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <span className="text-xs font-mono uppercase tracking-widest">Checking Administrator Authorization...</span>
          </div>
        </div>
      );
    }

    if (!adminAuth.authenticated || !adminAuth.profile) {
      return (
        <AdminLogin
          onLoginSuccess={async (profile) => {
            // Establish authentication state
            setAdminAuth({ checked: true, authenticated: true, profile });

            // Check for preserved intended destination in URL parameter
            const params = new URLSearchParams(window.location.search);
            const redirectParam = params.get('redirect');
            let destination = '/admin';

            // Validate that redirect is an authorized internal admin route
            if (redirectParam && redirectParam.startsWith('/admin') && !redirectParam.includes('//')) {
              destination = redirectParam;
            }

            window.history.pushState({}, '', destination);
            setIsAdminRoute(true);
          }}
          onBackToSite={navigateToPublic}
        />
      );
    }

    return (
      <AdminPanel
        initialProfile={adminAuth.profile}
        onLogout={handleLogout}
        onPreviewSite={() => {
          navigateToPublic();
          fetchPublicPortfolio();
        }}
      />
    );
  }

  // Maintenance screen
  if (maintenanceMode) {
    return (
      <div className="min-h-screen bg-[#090b10] flex flex-col justify-center items-center px-6 text-center text-slate-100">
        <div className="max-w-md space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 inline-block">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">System Under Scheduled Maintenance</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            We are performing updates to our distributed infrastructure. The portfolio will be available shortly.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter bypass token..."
                value={previewTokenInput}
                onChange={(e) => setPreviewTokenInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
              />
              <button
                onClick={() => {
                  if (previewTokenInput) {
                    window.location.search = `?preview=${encodeURIComponent(previewTokenInput)}`;
                  }
                }}
                className="px-3 py-2 text-xs font-semibold bg-white text-slate-950 rounded-lg hover:bg-slate-200"
              >
                Access
              </button>
            </div>
            <button
              onClick={() => navigateToAdmin()}
              className="text-xs text-indigo-400 hover:underline pt-2"
            >
              Administrator Login →
            </button>
          </div>
        </div>
      </div>
    );
  }


  const availableSections = ['home', 'about', 'work', 'contact'];
  if (portfolioData.experience && portfolioData.experience.length > 0) availableSections.push('experience');
  if (portfolioData.skills && portfolioData.skills.length > 0) availableSections.push('skills');
  if (portfolioData.services && portfolioData.services.length > 0) availableSections.push('services');
  if (portfolioData.education && portfolioData.education.length > 0) availableSections.push('education');
  if (portfolioData.certifications && portfolioData.certifications.length > 0) availableSections.push('certifications');
  if (portfolioData.achievements && portfolioData.achievements.length > 0) availableSections.push('achievements');
  if (portfolioData.resume && portfolioData.resume.url && portfolioData.resume.allowDownload) availableSections.push('resume');
  if (portfolioData.testimonials && portfolioData.testimonials.length > 0) availableSections.push('testimonials');
  if (portfolioData.blog && portfolioData.blog.length > 0) availableSections.push('blog');
  if (portfolioData.githubActivity && portfolioData.githubActivity.username) availableSections.push('github');
  if (portfolioData.faq && portfolioData.faq.length > 0) availableSections.push('faq');

  // Render Public Website (Home, About, Work, Contact + Dynamic Future Sections + Footer)
  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Top Bar */}
      <Navbar
        config={portfolioData.headerFooter}
        onNavigateToAdmin={() => navigateToAdmin()}
        activeSection={activeSection}
        availableSections={availableSections}
      />

      <main>
        {/* 1. Home / Hero Section */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'home')?.isEnabled !== false) && (
          <Hero
            content={portfolioData.home}
            socialLinks={portfolioData.socialLinks}
          />
        )}

        {/* 2. About Section */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'about')?.isEnabled !== false) && (
          <About
            content={portfolioData.about}
            skills={portfolioData.skills}
            allowResumeDownload={portfolioData.settings.allowResumeDownload}
          />
        )}

        {/* 3. Experience & Career History */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'experience')?.isEnabled !== false) && (
          <Experience
            experience={portfolioData.experience}
          />
        )}

        {/* 4. Skills & Technologies */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'skills')?.isEnabled !== false) && (
          <SkillsSection
            skills={portfolioData.skills}
          />
        )}

        {/* 5. Projects / Work & Case Studies */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'work')?.isEnabled !== false) && (
          <Work
            projects={portfolioData.projects}
          />
        )}

        {/* 6. Specialized Engineering Services */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'services')?.isEnabled !== false) && (
          <ServicesSection
            services={portfolioData.services}
          />
        )}

        {/* 7. Education & Academics */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'education')?.isEnabled !== false) && (
          <EducationSection
            education={portfolioData.education}
          />
        )}

        {/* 8. Certifications */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'certifications')?.isEnabled !== false) && (
          <Certifications
            certifications={portfolioData.certifications}
          />
        )}

        {/* 9. Achievements & Awards */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'achievements')?.isEnabled !== false) && (
          <Achievements
            achievements={portfolioData.achievements}
          />
        )}

        {/* 10. Resume / CV Download Section */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'resume')?.isEnabled !== false) && (
          <ResumeSection
            resume={portfolioData.resume}
          />
        )}

        {/* 11. Testimonials & Endorsements */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'testimonials')?.isEnabled !== false) && (
          <TestimonialsSection
            testimonials={portfolioData.testimonials}
          />
        )}

        {/* 12. Blog & Technical Monographs */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'blog')?.isEnabled !== false) && (
          <BlogSection
            posts={portfolioData.blog}
          />
        )}

        {/* 13. GitHub & Open Source Activity */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'github')?.isEnabled !== false) && (
          <GithubSection
            activity={portfolioData.githubActivity}
          />
        )}

        {/* 14. FAQ Section */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'faq')?.isEnabled !== false) && (
          <FaqSection
            faq={portfolioData.faq}
          />
        )}

        {/* 15. Contact Inquiries */}
        {(!portfolioData.modularSections || portfolioData.modularSections.find((s) => s.slug === 'contact')?.isEnabled !== false) && (
          <Contact
            contactEmail={portfolioData.settings.contactEmail}
            socialLinks={portfolioData.socialLinks}
          />
        )}

        {/* Dynamic Extra Custom Pages */}
        <FutureSectionRenderer
          sections={portfolioData.modularSections}
        />
      </main>

      {/* Global Footer */}
      <Footer
        config={portfolioData.headerFooter}
        socialLinks={portfolioData.socialLinks}
        onNavigateToAdmin={() => navigateToAdmin()}
      />
    </div>
  );
}
