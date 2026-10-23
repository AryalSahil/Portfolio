import React from 'react';
import { ServiceItem } from '../../types/portfolio.js';
import { Sparkles, Check, ArrowUpRight, Zap } from 'lucide-react';

interface ServicesSectionProps {
  services: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  const publishedItems = (services || [])
    .filter((s) => s.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <Zap className="w-4 h-4" />
            <span>Consulting & Offerings</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Specialized Services & Capabilities
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Technical consulting, software architecture advisory, and engineering delivery capabilities available for engagements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {publishedItems.map((srv) => (
            <div
              key={srv.id}
              className="p-8 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-6 shadow-xl group"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  {srv.pricing && (
                    <span className="text-xs font-mono text-indigo-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 font-semibold">
                      {srv.pricing}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors tracking-tight">
                    {srv.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {srv.description}
                  </p>
                </div>

                {srv.deliverables && srv.deliverables.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Key Deliverables
                    </div>
                    <ul className="space-y-2">
                      {srv.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={scrollToContact}
                className="w-full py-3 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2 group-hover:border-indigo-500/50 cursor-pointer"
              >
                <span>Inquire About Service</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
