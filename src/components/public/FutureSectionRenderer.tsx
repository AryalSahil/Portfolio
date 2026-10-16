import React from 'react';
import { ModularSection } from '../../types/portfolio.js';
import { Sparkles } from 'lucide-react';

interface FutureSectionRendererProps {
  sections: ModularSection[];
}

export const FutureSectionRenderer: React.FC<FutureSectionRendererProps> = ({ sections }) => {
  // Only render modular sections that are explicitly enabled and not part of the initial 4
  const activeExtraSections = (sections || []).filter(
    (s) => s.isEnabled && !['home', 'about', 'work', 'contact'].includes(s.slug)
  );

  if (activeExtraSections.length === 0) {
    return null;
  }

  return (
    <>
      {activeExtraSections.map((sec) => (
        <section key={sec.id} id={sec.slug} className="py-20 border-t border-slate-800/60">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-6">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>{sec.name}</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{sec.name}</h2>
            <p className="text-slate-400 text-sm max-w-2xl">{sec.description}</p>
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center text-slate-500 text-xs font-mono">
              Module "{sec.name}" is active. Content can be authored through the Admin Management Console.
            </div>
          </div>
        </section>
      ))}
    </>
  );
};
