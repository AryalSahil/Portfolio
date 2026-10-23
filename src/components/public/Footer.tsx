import React from 'react';
import { HeaderFooterConfig, SocialLink } from '../../types/portfolio.js';
import { ArrowUp, Github, Linkedin, Twitter, Youtube, Globe, Lock } from 'lucide-react';

interface FooterProps {
  config: HeaderFooterConfig;
  socialLinks: SocialLink[];
  onNavigateToAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, socialLinks, onNavigateToAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'x':
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const enabledSocialLinks = (socialLinks || []).filter((s) => s.isEnabled !== false);
  const brandTitle = config.brandName || 'Portfolio';
  const copyright = config.copyrightText || `© ${new Date().getFullYear()} ${brandTitle}. All rights reserved.`;

  return (
    <footer className="border-t border-slate-800/80 bg-[#08090d] py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Statement */}
          <div className="space-y-2 max-w-md">
            <div className="text-base font-bold text-white tracking-tight">
              {brandTitle}
            </div>
            {config.footerText && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {config.footerText}
              </p>
            )}
          </div>

          {/* Social Links & Back to Top */}
          <div className="flex flex-wrap items-center gap-4">
            {config.showSocialInFooter && enabledSocialLinks.length > 0 && (
              <div className="flex items-center gap-2">
                {enabledSocialLinks.map((link) => (
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
            )}

            <button
              onClick={scrollToTop}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              title="Return to top"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="hidden sm:inline">Top</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin Portal entry */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>{copyright}</div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToAdmin}
              className="hover:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
