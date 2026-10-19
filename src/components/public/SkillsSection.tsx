import React, { useState } from 'react';
import { SkillItem } from '../../types/portfolio.js';
import { Cpu, Layers, Sparkles } from 'lucide-react';

interface SkillsSectionProps {
  skills: SkillItem[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const visibleSkills = (skills || [])
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  if (visibleSkills.length === 0) return null;

  const categories = ['All', ...Array.from(new Set(visibleSkills.map((s) => s.category)))];

  const filtered = selectedCategory === 'All'
    ? visibleSkills
    : visibleSkills.filter((s) => s.category === selectedCategory);

  return (
    <section id="skills" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
              <Cpu className="w-4 h-4" />
              <span>Technical Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Skills & Core Technologies
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Curated stack of languages, distributed frameworks, design engineering primitives, and cloud orchestration tools.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill) => (
            <div
              key={skill.id}
              className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors">
                  {skill.name}
                </div>
                <span className="text-xs font-mono text-indigo-400 font-bold tabular-nums">
                  {skill.proficiency}%
                </span>
              </div>

              {/* Progress track */}
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-700"
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-600" />
                  {skill.category}
                </span>
                <span>
                  {skill.proficiency >= 90 ? 'Mastery' : skill.proficiency >= 80 ? 'Advanced' : 'Proficient'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
