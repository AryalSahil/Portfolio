import React, { useEffect } from 'react';
import { ProjectItem } from '../../types/portfolio.js';
import { X, ExternalLink, Github, Calendar, Layers } from 'lucide-react';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0f1118] border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0f1118]/95 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">
              Project Case Study
            </span>
            {project.isFeatured && (
              <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close Project Details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thumbnail Hero */}
        <div className="w-full aspect-[16/9] max-h-[420px] bg-slate-950 overflow-hidden relative">
          <img
            src={project.thumbnail}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1118] via-transparent to-transparent opacity-90" />
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{project.title}</h3>
            {project.subtitle && (
              <p className="text-sm sm:text-base text-indigo-300 font-medium mt-1">{project.subtitle}</p>
            )}
          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 font-mono py-3 border-y border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Released {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
            </div>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>{project.tags.length} Technologies</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>{project.description}</p>
            {project.longDescription && (
              <div className="text-slate-300/90 pt-2 border-t border-slate-800/40">
                <p>{project.longDescription}</p>
              </div>
            )}
          </div>

          {/* Technology Tags (Zero-Pill clean typography) */}
          <div className="space-y-2 pt-2">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-500">Tech Stack & Tools</div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-indigo-300 font-mono">
              {project.tags.map((tag, idx) => (
                <span key={idx} className="flex items-center gap-2">
                  <span>{tag}</span>
                  {idx < project.tags.length - 1 && <span aria-hidden="true" className="text-slate-700">/</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                <span>Launch Live Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                <span>View Source Repository</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
