import React, { useState } from 'react';
import { CustomPage } from '../../types/portfolio.js';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, Loader2, FileCode, Eye, X } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageCustomPagesViewProps {
  customPages: CustomPage[];
  onRefresh: () => Promise<void>;
}

export const ManageCustomPagesView: React.FC<ManageCustomPagesViewProps> = ({ customPages, onRefresh }) => {
  const [pages, setPages] = useState<CustomPage[]>(customPages || []);
  const [editingPage, setEditingPage] = useState<Partial<CustomPage> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  React.useEffect(() => {
    if (customPages) {
      setPages(customPages);
    }
  }, [customPages]);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingPage({
      title: '',
      slug: '',
      content: '',
      isPublished: true,
    });
  };

  const handleOpenEdit = (page: CustomPage) => {
    setIsNew(false);
    setEditingPage({ ...page });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete page "${title}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/customPages/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Custom page deleted successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Delete error' });
    }
  };

  const handleTogglePublish = async (page: CustomPage) => {
    try {
      const res = await authFetch(`/api/admin/customPages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !page.isPublished }),
      });
      if (!res.ok) throw new Error('Update failed');
      await onRefresh();
      setFeedback({
        type: 'success',
        message: `Page "${page.title}" ${!page.isPublished ? 'published' : 'unpublished'}.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Status update error' });
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title || !editingPage?.slug) {
      setFeedback({ type: 'error', message: 'Title and slug are required.' });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const url = isNew ? '/api/admin/customPages' : `/api/admin/customPages/${editingPage.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingPage,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to save custom page');
      await onRefresh();
      setEditingPage(null);
      setFeedback({ type: 'success', message: `Custom page ${isNew ? 'created' : 'updated'} successfully.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Save error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 sticky top-20 z-20 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Custom Pages & Standalone Content</h3>
          <p className="text-xs text-slate-400">Manage legal, privacy, terms, or dedicated content pages</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Custom Page</span>
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

      {pages.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0e1017]">
          <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No custom pages authored yet.</p>
          <button
            onClick={handleOpenNew}
            className="mt-3 text-xs text-indigo-400 hover:underline font-mono"
          >
            + Create your first custom page
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="p-5 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    /{page.slug}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(page)}
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
                      page.isPublished
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    }`}
                  >
                    {page.isPublished ? 'Published' : 'Draft'}
                  </button>
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {page.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {page.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Updated: {new Date(page.updatedAt || Date.now()).toLocaleDateString()}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(page)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Page"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id, page.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0e1017] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isNew ? 'Create New Custom Page' : `Edit Page: ${editingPage.title}`}
              </h3>
              <button
                onClick={() => setEditingPage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Page Title *</label>
                <input
                  type="text"
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                  placeholder="e.g. Privacy Policy & Compliance"
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">URL Slug *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 text-xs font-mono text-slate-500 bg-slate-900 border border-r-0 border-slate-800 rounded-l-lg">/</span>
                  <input
                    type="text"
                    value={editingPage.slug || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                    placeholder="privacy"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-r-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Page Content (Markdown / Text) *</label>
                <textarea
                  rows={8}
                  value={editingPage.content || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  placeholder="Write complete section copy, policy, terms, or documentation..."
                  required
                  className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPage.isPublished ?? true}
                  onChange={(e) => setEditingPage({ ...editingPage, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <div>
                  <span className="text-xs font-semibold text-white">Publish this page publicly</span>
                  <p className="text-[11px] text-slate-400">If unchecked, page is preserved as an administrative draft.</p>
                </div>
              </label>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 rounded-lg flex items-center gap-1.5 shadow"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Custom Page</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
