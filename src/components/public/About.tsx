import React, { useState } from 'react';
import { AboutContent, SkillItem } from '../../types/portfolio.js';
import { Download, GraduationCap, Target, Heart, CheckCircle2, Circle } from 'lucide-react';

interface AboutProps {
  content: AboutContent;
  skills: SkillItem[];
  allowResumeDownload: boolean;
}

export const About: React.FC<AboutProps> = ({ content, skills, allowResumeDownload }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(skills.map((s) => s.category)))];

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter((s) => s.category === selectedCategory);

  const sortedEducation = [...(content.education || [])].sort((a, b) => a.order - b.order);

  return (
    <section id="about" className="py-20 md:py-28 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-20">
        {/* Section Header */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
            01. Background & Philosophy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
            {content.bioTitle || 'Architecting resilient software systems with craft and intention.'}
          </h2>
        </div>

        {/* Bio & Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Biography Paragraphs & Resume CTA */}
          <div className="lg:col-span-7 space-y-6 text-slate-300 leading-relaxed text-base sm:text-lg">
            {content.bioParagraphs && content.bioParagraphs.map((p, idx) => (
              <p key={idx} className="text-slate-300">
                {p}
              </p>
            ))}

            {/* Resume Download (if enabled) */}
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

          {/* Right Column: Creative Workspace / Secondary Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40 p-2 shadow-xl group">
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative">
                <img
                  src={content.profilePhotoUrl || '/src/assets/images/about_workspace_1792149624407.jpg'}
                  alt="Creative Workspace"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <div className="text-xs font-mono text-slate-300">Creative Studio & Engineering Rig</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section with Zero-Pill Interactive Filters */}
        <div className="space-y-8 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Technical Mastery & Stack</h3>
              <p className="text-xs text-slate-400 mt-1">Core languages, cloud platforms, and architecture disciplines</p>
            </div>

            {/* Segmented Filter Control */}
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
                {/* Clean progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>{skill.category}</span>
                  <span>Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education & Career Goals 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-slate-800/80">
          {/* Education Timeline */}
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
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">{edu.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Career Milestones & Interests */}
          <div className="space-y-8">
            {/* Career Milestones */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white tracking-tight">Strategic Objectives & Milestones</h3>
              </div>

              <div className="space-y-2.5">
                {content.careerGoals && content.careerGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-800/60 bg-slate-900/30 text-xs"
                  >
                    {goal.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-0.5">
                      <div className={`font-medium ${goal.isCompleted ? 'text-slate-300 line-through' : 'text-white'}`}>
                        {goal.goal}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">Target: {goal.timeframe}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Interests */}
            {content.interests && content.interests.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-white">Focus & Creative Obsessions</h4>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-slate-400">
                  {content.interests.map((interest, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span>{interest}</span>
                      {i < content.interests.length - 1 && <span aria-hidden="true" className="text-slate-600">·</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
