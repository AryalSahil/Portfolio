import React from 'react';
import { AchievementItem } from '../../types/portfolio.js';
import { Trophy, Award, Sparkles, ExternalLink, Calendar } from 'lucide-react';

interface AchievementsProps {
  achievements: AchievementItem[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const publishedItems = (achievements || [])
    .filter((a) => a.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  const getIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'award': return <Award className="w-5 h-5 text-amber-400" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-indigo-400" />;
      default: return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <section id="achievements" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Honors & Recognitions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Key Honors & Achievements
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Notable awards, honors, and milestones recognized throughout my career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedItems.map((ach) => (
            <div
              key={ach.id}
              className="p-6 md:p-8 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    {getIcon(ach.badgeIcon)}
                  </div>
                  {ach.date && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{ach.date}</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {ach.title}
                  </h3>
                  {ach.organization && (
                    <div className="text-xs text-indigo-400 font-medium pt-0.5">
                      {ach.organization}
                    </div>
                  )}
                </div>

                {ach.description && (
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {ach.description}
                  </p>
                )}
              </div>

              {ach.url && (
                <a
                  href={ach.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-3 border-t border-slate-800"
                >
                  <span>Learn more</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
