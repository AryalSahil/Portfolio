import React, { useState } from 'react';
import { AboutContent, EducationItem, CareerGoalItem } from '../../types/portfolio.js';
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, GraduationCap, Target } from 'lucide-react';

interface ManageAboutViewProps {
  initialData: AboutContent;
  onSave: (data: AboutContent) => Promise<void>;
  onOpenMediaLibrary?: () => void;
}

export const ManageAboutView: React.FC<ManageAboutViewProps> = ({ initialData, onSave, onOpenMediaLibrary }) => {
  const [formData, setFormData] = useState<AboutContent>(initialData);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Paragraphs
  const handleParagraphChange = (index: number, val: string) => {
    const updated = [...formData.bioParagraphs];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, bioParagraphs: updated }));
  };

  const handleAddParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      bioParagraphs: [...prev.bioParagraphs, 'New descriptive paragraph about engineering philosophy and experience.'],
    }));
  };

  const handleRemoveParagraph = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      bioParagraphs: prev.bioParagraphs.filter((_, i) => i !== index),
    }));
  };

  // Education CRUD
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'Degree or Specialization',
      institution: 'University / Institute',
      period: '2020 — 2024',
      description: 'Focus area, achievements, and academic milestones.',
      order: (formData.education?.length || 0) + 1,
    };
    setFormData((prev) => ({ ...prev, education: [...(prev.education || []), newEdu] }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationItem, val: any) => {
    const updated = [...(formData.education || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData((prev) => ({ ...prev, education: updated }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  // Career Goals CRUD
  const handleAddGoal = () => {
    const newGoal: CareerGoalItem = {
      id: `cg-${Date.now()}`,
      goal: 'Strategic career milestone or research objective',
      timeframe: '2026-2027',
      isCompleted: false,
    };
    setFormData((prev) => ({ ...prev, careerGoals: [...(prev.careerGoals || []), newGoal] }));
  };

  const handleUpdateGoal = (index: number, field: keyof CareerGoalItem, val: any) => {
    const updated = [...(formData.careerGoals || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData((prev) => ({ ...prev, careerGoals: updated }));
  };

  const handleRemoveGoal = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      careerGoals: (prev.careerGoals || []).filter((_, i) => i !== index),
    }));
  };

  // Interests (comma-separated string or array)
  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const items = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, interests: items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(formData);
      setFeedback({ type: 'success', message: 'About content and timeline saved successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update About section.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/60 sticky top-20 z-20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Section Status:</span>
          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${formData.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'}`}>
            {formData.isPublished ? 'Published & Live' : 'Draft Only'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPublished: e.target.checked }))}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Publish to live site</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
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

      {/* Biography & Workspace Photo */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
          Biography & Visual Media
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Section Headline</label>
          <input
            type="text"
            value={formData.bioTitle}
            onChange={(e) => setFormData((prev) => ({ ...prev, bioTitle: e.target.value }))}
            required
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Paragraphs list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Bio Paragraphs</label>
            <button
              type="button"
              onClick={handleAddParagraph}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Paragraph</span>
            </button>
          </div>

          {formData.bioParagraphs && formData.bioParagraphs.map((p, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <textarea
                rows={3}
                value={p}
                onChange={(e) => handleParagraphChange(idx, e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 resize-y"
              />
              <button
                type="button"
                onClick={() => handleRemoveParagraph(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 mt-1 cursor-pointer"
                title="Remove paragraph"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Profile / Workspace Photo */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Workspace / About Photo URL</label>
            {onOpenMediaLibrary && (
              <button
                type="button"
                onClick={onOpenMediaLibrary}
                className="text-xs text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0">
              <img
                src={formData.profilePhotoUrl || '/src/assets/images/about_workspace_1792149624407.jpg'}
                alt="Workspace Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              value={formData.profilePhotoUrl}
              onChange={(e) => setFormData((prev) => ({ ...prev, profilePhotoUrl: e.target.value }))}
              placeholder="/src/assets/images/about_workspace_..."
              className="flex-1 px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Resume Download Config */}
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white">Curriculum Vitae / Resume Download Button</span>
              <p className="text-[11px] text-slate-400">Allows visitors to download your verified resume document</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showResume}
                onChange={(e) => setFormData((prev) => ({ ...prev, showResume: e.target.checked }))}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display Button</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-mono">Button Label</label>
              <input
                type="text"
                value={formData.resumeButtonText || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, resumeButtonText: e.target.value }))}
                placeholder="Download Resume"
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-mono">Resume Document URL</label>
              <input
                type="text"
                value={formData.resumeUrl || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, resumeUrl: e.target.value }))}
                placeholder="/uploads/my_resume.pdf"
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Academic Background / Education */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Academic Education History</h3>
              <p className="text-xs text-slate-400">Degrees, certifications, and research programs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddEducation}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Degree</span>
          </button>
        </div>

        <div className="space-y-4">
          {formData.education && formData.education.map((edu, idx) => (
            <div key={edu.id} className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-400">Entry #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                  title="Remove degree"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Degree / Program</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-500">Timeframe</label>
                  <input
                    type="text"
                    value={edu.period}
                    onChange={(e) => handleUpdateEducation(idx, 'period', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500">Institution / University</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500">Summary & Focus</label>
                <textarea
                  rows={2}
                  value={edu.description}
                  onChange={(e) => handleUpdateEducation(idx, 'description', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Career Goals & Personal Interests */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Strategic Goals & Milestones</h3>
              <p className="text-xs text-slate-400">Action items, publications, and milestone tracking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddGoal}
            className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Goal</span>
          </button>
        </div>

        <div className="space-y-3">
          {formData.careerGoals && formData.careerGoals.map((g, idx) => (
            <div key={g.id} className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/30 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={g.isCompleted}
                  onChange={(e) => handleUpdateGoal(idx, 'isCompleted', e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-500 font-mono">Done</span>
              </label>

              <input
                type="text"
                value={g.goal}
                onChange={(e) => handleUpdateGoal(idx, 'goal', e.target.value)}
                placeholder="Milestone goal description"
                className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-indigo-500"
              />

              <input
                type="text"
                value={g.timeframe}
                onChange={(e) => handleUpdateGoal(idx, 'timeframe', e.target.value)}
                placeholder="2026"
                className="w-24 px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-slate-400 font-mono focus:outline-none focus:border-indigo-500"
              />

              <button
                type="button"
                onClick={() => handleRemoveGoal(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                title="Remove goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div className="pt-4 border-t border-slate-800/60 space-y-2">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Personal Interests & Obsessions (Comma Separated)
          </label>
          <input
            type="text"
            value={(formData.interests || []).join(', ')}
            onChange={handleInterestsChange}
            placeholder="Distributed Consensus, Modular Synthesis, Pour-Over Coffee..."
            className="w-full px-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </form>
  );
};
