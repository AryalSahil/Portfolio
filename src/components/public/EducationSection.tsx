import React from 'react';
import { EducationItem } from '../../types/portfolio.js';
import { GraduationCap, Calendar, Award } from 'lucide-react';

interface EducationSectionProps {
  education: EducationItem[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
  const publishedItems = (education || [])
    .filter((e) => e.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  return (
    <section id="education" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Academic Background</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Education & Research
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Foundational computer science research in distributed consensus, fault tolerance invariants, and human-computer interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publishedItems.map((edu) => (
            <div
              key={edu.id}
              className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all space-y-4 shadow-lg group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{edu.period}</span>
                  </span>
                  <Award className="w-5 h-5 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {edu.degree}
                  </h3>
                  <div className="text-sm font-medium text-slate-300 pt-0.5">
                    {edu.institution}
                  </div>
                </div>

                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {edu.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
