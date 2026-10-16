import React, { useState } from 'react';
import { SkillItem } from '../../types/portfolio.js';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, CheckCircle2, AlertCircle, Save, X, Loader2 } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageSkillsViewProps {
  skills: SkillItem[];
  onRefresh: () => Promise<void>;
}

export const ManageSkillsView: React.FC<ManageSkillsViewProps> = ({ skills, onRefresh }) => {
  const [editingSkill, setEditingSkill] = useState<Partial<SkillItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['Frontend', 'Backend', 'Cloud & DevOps', 'Design & Architecture', 'Tools'] as const;

  const filteredSkills = selectedCategory === 'All'
    ? skills
    : skills.filter((s) => s.category === selectedCategory);

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingSkill({
      name: '',
      category: 'Frontend',
      proficiency: 90,
      isVisible: true,
    });
  };

  const handleOpenEdit = (s: SkillItem) => {
    setIsNew(false);
    setEditingSkill({ ...s });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete skill "${name}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: `Deleted skill "${name}".` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleToggleVisibility = async (s: SkillItem) => {
    try {
      const res = await authFetch(`/api/admin/skills/${s.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !s.isVisible }),
      });
      if (!res.ok) throw new Error('Failed to update visibility');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= skills.length) return;

    const copy = [...skills];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const skillIds = copy.map((s) => s.id);
    try {
      const res = await authFetch('/api/admin/skills/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds }),
      });
      if (!res.ok) throw new Error('Reorder failed');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name) {
      alert('Skill name is required.');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (isNew) {
        res = await authFetch('/api/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSkill),
        });
      } else {
        res = await authFetch(`/api/admin/skills/${editingSkill.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingSkill),
        });
      }

      if (!res.ok) throw new Error('Failed to save skill.');
      await onRefresh();
      setEditingSkill(null);
      setFeedback({ type: 'success', message: `Skill "${editingSkill.name}" saved.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        {/* Category filter */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded font-medium cursor-pointer ${
                selectedCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
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

      {/* Skills list table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1017] overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {filteredSkills.map((skill, idx) => (
            <div
              key={skill.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 text-slate-500">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === skills.length - 1}
                    className="p-0.5 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white tracking-tight">{skill.name}</span>
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {skill.category}
                    </span>
                    {!skill.isVisible && (
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>Proficiency: <strong className="text-white font-mono tabular-nums">{skill.proficiency}%</strong></span>
                    <span>·</span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden inline-block align-middle">
                      <div className="h-full bg-indigo-500" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleVisibility(skill)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    skill.isVisible
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-amber-400 bg-amber-400/10'
                  }`}
                >
                  {skill.isVisible ? 'Hide' : 'Unhide'}
                </button>
                <button
                  onClick={() => handleOpenEdit(skill)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edit skill"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(skill.id, skill.name)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Delete skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0d0f16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isNew ? 'Add Technical Skill' : `Edit: ${editingSkill.name}`}
              </h3>
              <button
                onClick={() => setEditingSkill(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Skill Name *</label>
                <input
                  type="text"
                  value={editingSkill.name || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  required
                  placeholder="e.g. Distributed Consensus"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Category</label>
                <select
                  value={editingSkill.category || 'Frontend'}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-mono uppercase text-slate-400">Proficiency Percentage</label>
                  <span className="font-mono font-bold text-indigo-400">{editingSkill.proficiency}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={editingSkill.proficiency || 90}
                  onChange={(e) => setEditingSkill({ ...editingSkill, proficiency: Number(e.target.value) })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSkill.isVisible}
                    onChange={(e) => setEditingSkill({ ...editingSkill, isVisible: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Visible on Public Portfolio</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
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
