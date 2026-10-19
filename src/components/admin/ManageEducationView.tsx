import React, { useState, useEffect } from 'react';
import { EducationItem } from '../../types/portfolio.js';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Save, Loader2, Calendar, GraduationCap, X } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageEducationViewProps {
  education: EducationItem[];
  onRefresh: () => Promise<void>;
}

export const ManageEducationView: React.FC<ManageEducationViewProps> = ({ education, onRefresh }) => {
  const [items, setItems] = useState<EducationItem[]>(education);
  const [editingItem, setEditingItem] = useState<Partial<EducationItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (education) {
      setItems(education);
    }
  }, [education]);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingItem({
      degree: '',
      institution: '',
      period: '2020 — 2024',
      description: '',
      isPublished: true,
    });
  };

  const handleOpenEdit = (item: EducationItem) => {
    setIsNew(false);
    setEditingItem({ ...item });
  };

  const handleDelete = async (id: string, degree: string) => {
    if (!window.confirm(`Delete "${degree}" education record?`)) return;
    try {
      const res = await authFetch(`/api/admin/education/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: 'Education record deleted.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Delete error' });
    }
  };

  const handleTogglePublish = async (item: EducationItem) => {
    try {
      const res = await authFetch(`/api/admin/education/${item.id}`, {
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
    if (!editingItem?.degree || !editingItem.institution) {
      alert('Degree and institution are required.');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await authFetch('/api/admin/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem),
        });
      } else {
        res = await authFetch(`/api/admin/education/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingItem),
        });
      }

      if (!res.ok) throw new Error('Failed to save education record');
      await onRefresh();
      setEditingItem(null);
      setFeedback({ type: 'success', message: `Education "${editingItem.degree}" saved.` });
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
          <h3 className="text-sm font-bold text-white tracking-tight">Academic Degrees & Education</h3>
          <p className="text-xs text-slate-400">Manage university qualifications, research focus, and academic honors</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education Record</span>
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
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white tracking-tight">{item.degree}</h4>
                <span className="text-xs font-medium text-slate-400">· {item.institution}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.isPublished !== false
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.isPublished !== false ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono pt-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{item.period}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleTogglePublish(item)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                  item.isPublished !== false
                    ? 'border-slate-800 text-slate-400 hover:text-white'
                    : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                }`}
              >
                {item.isPublished !== false ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={() => handleOpenEdit(item)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 cursor-pointer"
                title="Edit Education"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id, item.degree)}
                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-slate-800 cursor-pointer"
                title="Delete Education"
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
                {isNew ? 'Add Education Qualification' : `Edit: ${editingItem.degree}`}
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Degree / Qualification *</label>
                <input
                  type="text"
                  value={editingItem.degree || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                  required
                  placeholder="M.S. in Computer Science"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Institution / University *</label>
                  <input
                    type="text"
                    value={editingItem.institution || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    required
                    placeholder="Stanford University"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono uppercase text-slate-400">Period *</label>
                  <input
                    type="text"
                    value={editingItem.period || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                    required
                    placeholder="2016 — 2018"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Description & Honors</label>
                <textarea
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Graduated Magna Cum Laude. Thesis on distributed consensus safety invariants..."
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
                  <span>Save Education</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
