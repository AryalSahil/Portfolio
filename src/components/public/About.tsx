import React, { useState } from 'react';
import { AboutContent, SkillItem } from '../../types/portfolio.js';
import { Download, GraduationCap, Target, Heart, CheckCircle2, Circle, User } from 'lucide-react';

interface AboutProps {
  content: AboutContent;
  skills: SkillItem[];
  allowResumeDownload: boolean;
}

export const About: React.FC<AboutProps> = ({ content, skills, allowResumeDownload }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const hasBio = Boolean(
    (content?.bioTitle && content.bioTitle.trim().length > 0) ||
    (content?.bioParagraphs && content.bioParagraphs.length > 0 && content.bioParagraphs.some((p) => p.trim().length > 0))
  );

  const visibleSkills = (skills || []).filter((s) => s.isVisible !== false);
  const categories = ['All', ...Array.from(new Set(visibleSkills.map((s) => s.category)))];

  const filteredSkills = selectedCategory === 'All'
    ? visibleSkills
    : visibleSkills.filter((s) => s.category === selectedCategory);

  const sortedEducation = [...(content?.education || [])]
    .filter((e) => e.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  const goals = (content?.careerGoals || []).filter((g) => g.goal?.trim().length > 0);
  const interests = (content?.interests || []).filter((i) => i.trim().length > 0);

  // If nothing in About has been populated or published, render clean placeholder
  if (!hasBio && visibleSkills.length === 0 && sortedEducation.length === 0 && goals.length === 0 && interests.length === 0) {
    return (
      <section id="about" className="py-20 md:py-28 border-t border-slate-800/60 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-8">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
              About & Bio
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              About Me
            </h2>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-[#0e1017] text-center max-w-2xl mx-auto space-y-4 shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Biography Coming Soon
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Detailed background, technical philosophy, and career information are being prepared. In the meantime, feel free to reach out via the contact form.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 md:py-28 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-20">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
            About & Bio
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
            {content.bioTitle || 'About & Professional Background'}
          </h2>
        </div>

        {/* Bio & Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Biography Paragraphs & Resume CTA */}
          <div className={`${content.profilePhotoUrl ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-6 text-slate-300 leading-relaxed text-base sm:text-lg`}>
            {content.bioParagraphs && content.bioParagraphs.length > 0 ? (
              content.bioParagraphs.map((p, idx) => (
                <p key={idx} className="text-slate-300">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-slate-400 italic">Biography in progress.</p>
            )}

            {/* Resume Download (if enabled and URL provided) */}
            {content.showResume && allowResumeDownload && content.resumeUrl && (
              <div className="pt-4">
                <a
                  href={content.resumeUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 border border-slate-700/80 hover:border-slate-500 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>{content.resumeButtonText || 'Download Resume (PDF)'}</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Photo (ONLY if real photo uploaded) */}
          {content.profilePhotoUrl && (
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40 p-2 shadow-xl group">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative">
                  <img
                    src={content.profilePhotoUrl}
                    alt="Profile Workspace"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Skills Section inside About (only if populated) */}
        {visibleSkills.length > 0 && (
          <div className="space-y-8 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Technical Mastery & Stack</h3>
                <p className="text-xs text-slate-400 mt-1">Core languages, frameworks, and architecture disciplines</p>
              </div>

              {/* Segmented Filter Control */}
              {categories.length > 2 && (
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg self-start">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700/80 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white tracking-tight">{skill.name}</span>
                    <span className="text-xs font-mono text-indigo-400 tabular-nums">{skill.proficiency}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{skill.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Career Goals (only if populated) */}
        {(sortedEducation.length > 0 || goals.length > 0 || interests.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-800/80">
            {/* Education Timeline */}
            {sortedEducation.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xl font-bold text-white tracking-tight">Academic Foundations</h3>
                </div>

                <div className="space-y-6 pl-2 border-l border-slate-800">
                  {sortedEducation.map((edu) => (
                    <div key={edu.id} className="relative pl-6 space-y-1 group">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                      <div className="text-xs font-mono text-indigo-400">{edu.period}</div>
                      <h4 className="text-base font-semibold text-white tracking-tight">{edu.degree}</h4>
                      <div className="text-xs text-slate-400 font-medium">{edu.institution}</div>
                      {edu.description && (
                        <p className="text-xs text-slate-400 leading-relaxed pt-1">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Goals & Interests */}
            <div className="space-y-8">
              {goals.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">Focus & Objectives</h3>
                  </div>

                  <div className="space-y-3">
                    {goals.map((g) => (
                      <div key={g.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/30 flex items-start gap-3">
                        {g.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm text-slate-300 font-medium">{g.goal}</p>
                          {g.timeframe && (
                            <span className="text-[11px] font-mono text-indigo-400/80">{g.timeframe}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {interests.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xl font-bold text-white tracking-tight">Areas of Interest</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
