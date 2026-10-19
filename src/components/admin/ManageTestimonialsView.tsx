import React, { useState, useEffect } from 'react';
import { TestimonialItem } from '../../types/portfolio.js';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, Loader2, MessageSquare, Star, X } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageTestimonialsViewProps {
  testimonials: TestimonialItem[];
  onRefresh: () => Promise<void>;
  onOpenMediaLibrary?: () => void;
}

export const ManageTestimonialsView: React.FC<ManageTestimonialsViewProps> = ({ testimonials, onRefresh }) => {
  const [items, setItems] = useState<TestimonialItem[]>(testimonials);
  const [editingItem, setEditingItem] = useState<Partial<TestimonialItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (testimonials) {
      setItems(testimonials);
    }
  }, [testimonials]);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingItem({
      clientName: '',
      clientRole: 'VP of Engineering',
      clientCompany: 'Tech Corp',
      content: '',
      rating: 5,
      avatarUrl: '',
      isPublished: true,
    });
  };

  const handleOpenEdit = (item: TestimonialItem) => {
    setIsNew(false);
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Testimonial deleted.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Delete error' });
    }
  };

  const handleTogglePublish = async (item: TestimonialItem) => {
    try {
      const res = await authFetch(`/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.clientName || !editingItem.content) {
      alert('Client name and content are required.');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await authFetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem),
        });
      } else {
        res = await authFetch(`/api/admin/testimonials/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem),
        });
      }

      if (!res.ok) throw new Error('Failed to save testimonial');
      await onRefresh();
      setEditingItem(null);
      setFeedback({ type: 'success', message: `Testimonial from "${editingItem.clientName}" saved.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Client & Peer Endorsements</h3>
          <p className="text-xs text-slate-400">Manage client references, feedback quotes, and 5-star ratings</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Endorsement</span>
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

      {/* List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">{item.clientName}</h4>
                <span className="text-xs font-medium text-slate-400">· {item.clientRole} ({item.clientCompany})</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.isPublished
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 italic">"{item.content}"</p>
              <div className="flex items-center gap-1 text-amber-400 pt-0.5">
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400" />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleTogglePublish(item)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  item.isPublished
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {item.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 cursor-pointer"
                title="Edit Testimonial"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id, item.clientName)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 cursor-pointer"
                title="Delete Testimonial"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0d0f16] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isNew ? 'Add Client Endorsement' : `Edit: ${editingItem.clientName}`}
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Client / Peer Name *</label>
                <input
                  type="text"
                  value={editingItem.clientName || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, clientName: e.target.value })}
                  required
                  placeholder="Julian Alvarez"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Role / Title *</label>
                  <input
                    type="text"
                    value={editingItem.clientRole || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, clientRole: e.target.value })}
                    required
                    placeholder="VP of Engineering"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Company / Organization *</label>
                  <input
                    type="text"
                    value={editingItem.clientCompany || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, clientCompany: e.target.value })}
                    required
                    placeholder="Stratos Cloud Platforms"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Rating (Stars)</label>
                <select
                  value={editingItem.rating || 5}
                  onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={5}>5 Stars (Exceptional)</option>
                  <option value={4}>4 Stars (Strong)</option>
                  <option value={3}>3 Stars (Good)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Quote / Endorsement Text *</label>
                <textarea
                  rows={4}
                  value={editingItem.content || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                  required
                  placeholder="Elena Vance is one of the rarest software engineers in the industry..."
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPublished !== false}
                    onChange={(e) => setEditingItem({ ...editingItem, isPublished: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Published on Live Website</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Testimonial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
