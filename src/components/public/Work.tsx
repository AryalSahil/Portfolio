import React, { useState } from 'react';
import { ProjectItem } from '../../types/portfolio.js';
import { ProjectModal } from './ProjectModal.js';
import { ExternalLink, Github, ArrowUpRight, Sparkles } from 'lucide-react';

interface WorkProps {
  projects: ProjectItem[];
}

export const Work: React.FC<WorkProps> = ({ projects }) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);

  // Extract all distinct tags
  const allTags = ['All', 'Featured', ...Array.from(new Set(projects.flatMap((p) => p.tags || [])))];

  const filteredProjects = projects.filter((project) => {
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Featured') return project.isFeatured;
    return project.tags?.includes(selectedTag);
  });

  return (
    <section id="work" className="py-20 md:py-28 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-widest text-indigo-400 font-semibold font-mono">
              02. Selected Work & Case Studies
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Featured Engineering & Design Systems
            </h2>
          </div>

          {/* Interactive Tag Filter Segmented Control */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
            {allTags.slice(0, 6).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tag === 'Featured' && <Sparkles className="w-3 h-3 text-amber-300" />}
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects Bento / Responsive Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
            <p className="text-slate-400 text-sm">No projects match the selected filter.</p>
            <button
              onClick={() => setSelectedTag('All')}
              className="mt-3 text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              Show all projects
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70 hover:border-slate-700/80 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 cursor-pointer"
                onClick={() => setActiveModalProject(project)}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />

                  {/* Top corner indicators */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {project.isFeatured && (
                      <span className="text-[11px] font-mono text-amber-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-amber-500/30">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{new Date(project.createdAt).getFullYear()}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate max-w-[180px]">{project.tags?.[0] || 'System'}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                      <span>{project.title}</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                    </h3>

                    {project.subtitle && (
                      <p className="text-xs text-slate-400 font-medium line-clamp-1">{project.subtitle}</p>
                    )}

                    <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Card Footer: Tech tags & Action Links */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {/* Tags preview */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono truncate max-w-[65%]">
                      {project.tags?.slice(0, 3).join(' / ')}
                    </div>

                    {/* External links (stops propagation to open modal) */}
                    <div className="flex items-center gap-2 shrink-0">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Source Code"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Live Demo"
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Case Study Modal */}
      <ProjectModal
        project={activeModalProject}
        onClose={() => setActiveModalProject(null)}
      />
    </section>
  );
};
