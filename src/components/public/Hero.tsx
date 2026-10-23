import React from 'react';
import { HomeContent, SocialLink } from '../../types/portfolio.js';
import { ArrowDown, ArrowUpRight, Github, Linkedin, Twitter, Youtube, Globe, User, Sparkles } from 'lucide-react';

interface HeroProps {
  content: HomeContent;
  socialLinks: SocialLink[];
}

export const Hero: React.FC<HeroProps> = ({ content, socialLinks }) => {
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'x':
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const scrollTo = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.getElementById(href.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = href;
    }
  };

  const isConfigured = Boolean(content && content.name && content.name.trim().length > 0);

  // If hero is not yet configured, render a clean, professional empty state
  if (!isConfigured) {
    return (
      <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personal Portfolio</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
              Welcome to My Portfolio
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Selected works, engineering experience, and technical projects will be showcased here. In the meantime, you are welcome to reach out directly using the inquiry form below.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => scrollTo('#contact')}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-all duration-200 shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Get In Touch</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Configured Hero State
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Split Screen Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
              Hello, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">{content.name}</span>
            </h1>

            {/* Subtitle / Role */}
            {content.title && (
              <p className="text-xl sm:text-2xl font-medium text-slate-300">
                {content.title}
              </p>
            )}

            {/* Subtitle note */}
            {content.subtitle && (
              <p className="text-xs text-indigo-300/80 font-mono">
                {content.subtitle}
              </p>
            )}

            {/* Intro Lead */}
            {content.intro && (
              <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
                {content.intro}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => scrollTo(content.primaryCtaLink || '#work')}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-all duration-200 shadow-md hover:shadow-indigo-500/10 flex items-center gap-2 group cursor-pointer"
              >
                <span>{content.primaryCtaText || 'View My Work'}</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={() => scrollTo(content.secondaryCtaLink || '#contact')}
                className="px-6 py-3 text-sm font-semibold text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all duration-200 flex items-center gap-2 group cursor-pointer"
              >
                <span>{content.secondaryCtaText || 'Contact Me'}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-400 group-hover:text-white" />
              </button>
            </div>

            {/* Social Connectivity */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="pt-4 flex items-center gap-4 text-xs text-slate-400">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Connect</span>
                <div className="flex items-center gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
                      title={link.label}
                      aria-label={link.label}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Hero Visual Container */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] aspect-square rounded-2xl overflow-hidden border border-slate-800/90 bg-gradient-to-b from-slate-800/30 to-slate-950/80 shadow-2xl p-2 group">
              <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center bg-slate-900/50">
                {content.profilePhotoUrl ? (
                  <>
                    <img
                      src={content.profilePhotoUrl}
                      alt={content.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-sm font-semibold text-white tracking-tight">{content.name}</div>
                      {content.title && <div className="text-xs text-slate-400 truncate">{content.title}</div>}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-sky-400/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-bold text-indigo-300">
                      {content.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || <User className="w-8 h-8 text-indigo-400" />}
                    </div>
                    <div className="text-sm font-semibold text-white">{content.name}</div>
                    {content.title && <div className="text-xs text-slate-400">{content.title}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width KPI Strip below the hero split */}
        {content.showStats && content.stats && content.stats.length > 0 && (
          <div className="mt-16 sm:mt-24 pt-10 border-t border-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {content.stats.map((stat, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    {stat.label}
                  </div>
                  {stat.subtext && (
                    <div className="text-xs text-slate-500">
                      {stat.subtext}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
