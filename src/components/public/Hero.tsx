import React from 'react';
import { HomeContent, SocialLink } from '../../types/portfolio.js';
import { ArrowDown, ArrowUpRight, Github, Linkedin, Twitter, Youtube, Globe, Mail } from 'lucide-react';

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

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Split Screen Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 space-y-6">
            {/* Kicker */}
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
              Available for Selected High-Impact Projects
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
              Hello, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-300">{content.name}</span>
            </h1>

            {/* Subtitle / Role */}
            <p className="text-xl sm:text-2xl font-medium text-slate-300">
              {content.title}
            </p>

            {/* Subtitle note */}
            {content.subtitle && (
              <p className="text-xs text-indigo-300/80 font-mono">
                {content.subtitle}
              </p>
            )}

            {/* Intro Lead */}
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl">
              {content.intro}
            </p>

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
              <div className="w-full h-full rounded-xl overflow-hidden relative">
                <img
                  src={content.profilePhotoUrl || '/images/hero_portrait_1792149624424.jpg'}
                  alt={content.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center filter grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-sm font-semibold text-white tracking-tight">{content.name}</div>
                  <div className="text-xs text-slate-400 truncate">{content.title}</div>
                </div>
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
                  <div className="text-xs text-slate-500">
                    {stat.subtext}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
