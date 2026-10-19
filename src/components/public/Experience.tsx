import React from 'react';
import { ExperienceItem } from '../../types/portfolio.js';
import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface ExperienceProps {
  experience: ExperienceItem[];
}

export const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  const publishedItems = (experience || [])
    .filter((e) => e.isPublished)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  return (
    <section id="experience" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <Briefcase className="w-4 h-4" />
            <span>Career Progression</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Work Experience & Leadership
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            A decade of designing and scaling distributed systems, guiding principal engineering squads, and engineering mission-critical cloud software.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-slate-800 ml-4 md:ml-6 space-y-12">
          {publishedItems.map((item) => (
            <div key={item.id} className="relative pl-8 md:pl-10 group">
              {/* Timeline marker */}
              <div
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 transition-all ${
                  item.isCurrent
                    ? 'bg-indigo-500 border-indigo-300 ring-4 ring-indigo-500/20'
                    : 'bg-slate-900 border-slate-700 group-hover:border-indigo-400'
                }`}
              />

              <div className="p-6 md:p-8 rounded-2xl border border-slate-800/90 bg-[#0e1017] hover:border-slate-700 transition-all space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{item.role}</h3>
                    <div className="text-indigo-400 font-medium text-sm">{item.company}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.period}</span>
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.location}</span>
                      </span>
                    )}
                    {item.isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Present Role
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>

                {item.achievements && item.achievements.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">Key Impact & Achievements:</div>
                    <ul className="space-y-2">
                      {item.achievements.map((ach, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
