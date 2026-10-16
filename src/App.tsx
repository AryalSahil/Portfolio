/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PublicPortfolioData, AdminProfile } from './types/portfolio.js';
import { Navbar } from './components/public/Navbar.js';
import { Hero } from './components/public/Hero.js';
import { About } from './components/public/About.js';
import { Work } from './components/public/Work.js';
import { Contact } from './components/public/Contact.js';
import { Footer } from './components/public/Footer.js';
import { FutureSectionRenderer } from './components/public/FutureSectionRenderer.js';
import { AdminLogin } from './components/admin/AdminLogin.js';
import { AdminPanel } from './components/admin/AdminPanel.js';
import { Loader2, Wrench } from 'lucide-react';
import { authFetch, clearStoredSessionToken } from './utils/api.js';

export default function App() {
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(
    window.location.pathname.startsWith('/admin')
  );
  const [adminAuth, setAdminAuth] = useState<{ checked: boolean; authenticated: boolean; profile: AdminProfile | null }>({
    checked: false,
    authenticated: false,
    profile: null,
  });

  const [portfolioData, setPortfolioData] = useState<PublicPortfolioData | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [loadingPortfolio, setLoadingPortfolio] = useState<boolean>(true);
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
        const res = await authFetch('/api/auth/check');
        const json = await res.json();
        if (json.authenticated && json.profile) {
          setAdminAuth({ checked: true, authenticated: true, profile: json.profile });
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
    setLoadingPortfolio(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const preview = urlParams.get('preview');
      const fetchUrl = preview ? `/api/portfolio?preview=${encodeURIComponent(preview)}` : '/api/portfolio';

      const res = await fetch(fetchUrl);
      const json = await res.json();

      if (json.maintenance) {
        setMaintenanceMode(true);
      } else {
        setMaintenanceMode(false);
        setPortfolioData(json);
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    } finally {
      setLoadingPortfolio(false);
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

    const sections = ['home', 'about', 'work', 'contact'];
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

  // Public Portfolio Loading
  if (loadingPortfolio || !portfolioData) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Loading Portfolio...</span>
        </div>
      </div>
    );
  }

  // Render Public Website (Home, About, Work, Contact + Dynamic Future Sections + Footer)
  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Navigation Top Bar */}
      <Navbar
        config={portfolioData.headerFooter}
        onNavigateToAdmin={() => navigateToAdmin()}
        activeSection={activeSection}
      />

      <main>
        {/* 1. Home Section */}
        <Hero
          content={portfolioData.home}
          socialLinks={portfolioData.socialLinks}
        />

        {/* 2. About Section */}
        <About
          content={portfolioData.about}
          skills={portfolioData.skills}
          allowResumeDownload={portfolioData.settings.allowResumeDownload}
        />

        {/* 3. Work Section */}
        <Work
          projects={portfolioData.projects}
        />

        {/* 4. Contact Section */}
        <Contact
          contactEmail={portfolioData.settings.contactEmail}
          socialLinks={portfolioData.socialLinks}
        />

        {/* 5. Future Expansion Section Renderer (Experience, Certifications, Services, etc.) */}
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
