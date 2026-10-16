import React, { useState, useEffect } from 'react';
import { HeaderFooterConfig } from '../../types/portfolio.js';
import { Menu, X, ArrowUpRight, Lock } from 'lucide-react';

interface NavbarProps {
  config: HeaderFooterConfig;
  onNavigateToAdmin: () => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ config, onNavigateToAdmin, activeSection }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleNavItems = (config.navItems || [])
    .filter((item) => item.isVisible)
    .sort((a, b) => a.order - b.order);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0c0d12]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => scrollToSection(e, '#home')}
          className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.brandName} className="w-7 h-7 rounded object-cover" />
          ) : (
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm"></span>
          )}
          <span>{config.brandName || 'Portfolio'}</span>
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          {visibleNavItems.map((item) => {
            const isActive = activeSection === item.href.replace('#', '');
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-1 ${
                  isActive ? 'text-white font-semibold' : 'hover:text-white text-slate-300'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"></span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            onClick={(e) => scrollToSection(e, '#contact')}
            className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>Get In Touch</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onNavigateToAdmin}
            title="Administrator Portal"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
            aria-label="Admin Portal"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e1017] border-b border-slate-800 px-6 py-5 shadow-2xl space-y-4">
          <nav className="flex flex-col gap-3">
            {visibleNavItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => scrollToSection(e, item.href)}
                className="text-slate-200 hover:text-indigo-400 py-2 text-base font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <a
              href="#contact"
              onClick={(e) => scrollToSection(e, '#contact')}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg inline-flex items-center gap-1.5"
            >
              <span>Get In Touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToAdmin();
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 py-2 px-3 rounded bg-slate-800/50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
