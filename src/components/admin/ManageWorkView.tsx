import React, { useState } from 'react';
import { ProjectItem } from '../../types/portfolio.js';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ExternalLink,
  Github,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageWorkViewProps {
  projects: ProjectItem[];
  onRefresh: () => Promise<void>;
  onOpenMediaLibrary?: () => void;
}

export const ManageWorkView: React.FC<ManageWorkViewProps> = ({ projects, onRefresh, onOpenMediaLibrary }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'published' | 'draft'>('all');
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [tagsInput, setTagsInput] = useState('');

  const filtered = projects.filter((p) => {
    if (filterState === 'published' && !p.isPublished) return false;
    if (filterState === 'draft' && p.isPublished) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenNew = () => {
    setIsNew(true);
    setTagsInput('TypeScript, React, Node.js');
    setEditingProject({
      title: '',
      subtitle: '',
      slug: '',
      description: '',
      longDescription: '',
      thumbnail: '/src/assets/images/project_cloud_arch_1792149624510.jpg',
      tags: ['TypeScript', 'React'],
      liveUrl: '',
      githubUrl: '',
      isFeatured: false,
      isPublished: true,
      galleryImages: [],
    });
  };

  const handleOpenEdit = (p: ProjectItem) => {
    setIsNew(false);
    setTagsInput(p.tags?.join(', ') || '');
    setEditingProject({ ...p });
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await authFetch(`/api/admin/projects/${id}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Duplicate failed');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Project duplicated as a draft copy.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error duplicating project.' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete project "${title}"?`)) {
      return;
    }
    try {
      const res = await authFetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: `Deleted "${title}".` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error deleting project.' });
    }
  };

  const handleTogglePublish = async (p: ProjectItem) => {
    try {
      const res = await authFetch(`/api/admin/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !p.isPublished }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleFeatured = async (p: ProjectItem) => {
    try {
      const res = await authFetch(`/api/admin/projects/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !p.isFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update featured flag');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const copy = [...projects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const projectIds = copy.map((p) => p.id);
    try {
      const res = await authFetch('/api/admin/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds }),
      });
      if (!res.ok) throw new Error('Reorder failed');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject.description) {
      alert('Title and description are required.');
      return;
    }

    setSaving(true);
    const parsedTags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = { ...editingProject, tags: parsedTags };

    try {
      let res;
      if (isNew) {
        res = await authFetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await authFetch(`/api/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save project.');
      }

      await onRefresh();
      setEditingProject(null);
      setFeedback({ type: 'success', message: `Project "${payload.title}" saved successfully.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, stack, or summary..."
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64 sm:w-80"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilterState('all')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterState === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterState('published')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterState === 'published' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Published ({projects.filter((p) => p.isPublished).length})
            </button>
            <button
              onClick={() => setFilterState('draft')}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${filterState === 'draft' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Drafts ({projects.filter((p) => !p.isPublished).length})
            </button>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Projects Table / List */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1017] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            No projects found matching the current filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filtered.map((project, idx) => (
              <div
                key={project.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                {/* Project preview and info */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Reorder arrows */}
                  <div className="flex flex-col gap-1 text-slate-500">
                    <button
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === projects.length - 1}
                      className="p-1 hover:text-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-14 sm:w-24 sm:h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {project.title}
                      </span>
                      {project.isFeatured && (
                        <span className="text-[10px] font-mono font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                          project.isPublished
                            ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                            : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
                        }`}
                      >
                        {project.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
                      {project.subtitle || project.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>Order #{project.order}</span>
                      <span>·</span>
                      <span>{project.tags?.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleToggleFeatured(project)}
                    className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                      project.isFeatured
                        ? 'border-amber-500/40 text-amber-300 bg-amber-400/10'
                        : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={project.isFeatured ? 'Unmark Featured' : 'Mark as Featured'}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleTogglePublish(project)}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      project.isPublished
                        ? 'border-slate-800 text-slate-300 hover:text-amber-400'
                        : 'border-emerald-500/40 text-emerald-400 bg-emerald-400/10'
                    }`}
                  >
                    {project.isPublished ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleDuplicate(project.id)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    title="Duplicate Project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(project)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Modal Drawer */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-[#0d0f16] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d0f16]">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isNew ? 'Create New Showcase Project' : `Edit: ${editingProject.title}`}
                </h3>
                <p className="text-xs text-slate-400">Configure project details, stack tags, and presentation links</p>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal form body */}
            <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Project Title *</label>
                  <input
                    type="text"
                    value={editingProject.title || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    required
                    placeholder="e.g. Distributed Telemetry Mesh"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">URL Slug</label>
                  <input
                    type="text"
                    value={editingProject.slug || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                    placeholder="telemetry-mesh"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={editingProject.subtitle || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, subtitle: e.target.value })}
                  placeholder="Low-latency packet visualizer handling 250k events/sec"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Short Summary *</label>
                <textarea
                  rows={2}
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  required
                  placeholder="Concise overview shown on the card preview..."
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Detailed Case Study Description</label>
                <textarea
                  rows={4}
                  value={editingProject.longDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, longDescription: e.target.value })}
                  placeholder="Extended technical deep dive shown inside the detail modal..."
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              {/* Thumbnail URL with preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-slate-400">Thumbnail Image URL *</label>
                  {onOpenMediaLibrary && (
                    <button
                      type="button"
                      onClick={onOpenMediaLibrary}
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Select from Media Library</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                    <img
                      src={editingProject.thumbnail || '/src/assets/images/project_cloud_arch_1792149624510.jpg'}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="text"
                    value={editingProject.thumbnail || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                    required
                    placeholder="/src/assets/images/..."
                    className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tech Tags */}
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Technology Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="TypeScript, WebGL, Go, Redis"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Live and GitHub URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Live Demo URL</label>
                  <input
                    type="url"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    placeholder="https://my-project.dev"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/my-user/repo"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingProject.isPublished}
                    onChange={(e) => setEditingProject({ ...editingProject, isPublished: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Published on Live Portfolio</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingProject.isFeatured}
                    onChange={(e) => setEditingProject({ ...editingProject, isFeatured: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Featured Project Spotlight</span>
                </label>
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{isNew ? 'Create Project' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
