import React, { useState, useEffect } from 'react';
import { HomeContent } from '../../types/portfolio.js';
import { Save, Plus, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ImageUploader } from './ImageUploader.js';

interface ManageHomeViewProps {
  initialData: HomeContent;
  onSave: (data: HomeContent) => Promise<void>;
  onOpenMediaLibrary?: () => void;
}

export const ManageHomeView: React.FC<ManageHomeViewProps> = ({ initialData, onSave, onOpenMediaLibrary }) => {
  const [formData, setFormData] = useState<HomeContent>(initialData);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatChange = (index: number, field: string, value: string) => {
    const newStats = [...(formData.stats || [])];
    newStats[index] = { ...newStats[index], [field]: value };
    setFormData((prev) => ({ ...prev, stats: newStats }));
  };

  const handleAddStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { label: '', value: '', subtext: '' }],
    }));
  };

  const handleRemoveStat = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: (prev.stats || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(formData);
      setFeedback({ type: 'success', message: 'Home content saved and published successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update Home section.' });
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

      {/* Main Identity Information */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
          Hero Identity & Headline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Professional Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Subtitle / Tagline</label>
          <input
            type="text"
            name="subtitle"
            value={formData.subtitle || ''}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Hero Introduction</label>
          <textarea
            name="intro"
            rows={3}
            value={formData.intro}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* Profile Photo Upload & Preview */}
        <ImageUploader
          label="Hero Profile Photo"
          value={formData.profilePhotoUrl || ''}
          onChange={(url) => setFormData((prev) => ({ ...prev, profilePhotoUrl: url }))}
          onOpenMediaLibrary={onOpenMediaLibrary}
          placeholder="/images/hero_portrait_...jpg"
          aspectRatio="square"
          helperText="Upload JPG, PNG, or WebP or choose from Media Library"
        />
      </div>

      {/* Hero Buttons & Calls to Action */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
          Call-to-Action Buttons
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
            <div className="text-xs font-mono uppercase font-semibold text-indigo-400">Primary Button</div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Button Label</label>
              <input
                type="text"
                name="primaryCtaText"
                value={formData.primaryCtaText}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Target Link / Section ID</label>
              <input
                type="text"
                name="primaryCtaLink"
                value={formData.primaryCtaLink}
                onChange={handleChange}
                placeholder="#work"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
            <div className="text-xs font-mono uppercase font-semibold text-slate-300">Secondary Button</div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Button Label</label>
              <input
                type="text"
                name="secondaryCtaText"
                value={formData.secondaryCtaText}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Target Link / Section ID</label>
              <input
                type="text"
                name="secondaryCtaLink"
                value={formData.secondaryCtaLink}
                onChange={handleChange}
                placeholder="#contact"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Editor */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white tracking-tight">Key Metric Statistics</h3>
            <p className="text-xs text-slate-400">Quantitative indicators shown in the full-width strip below hero</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showStats}
                onChange={(e) => setFormData((prev) => ({ ...prev, showStats: e.target.checked }))}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display Stats Strip</span>
            </label>
            <button
              type="button"
              onClick={handleAddStat}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add Metric</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {formData.stats && formData.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="w-full sm:w-28 space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500">Value</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                  placeholder="10+"
                  className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-800 rounded font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500">Label</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                  placeholder="Years Experience"
                  className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex-1 w-full space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-500">Subtext Description</label>
                <input
                  type="text"
                  value={stat.subtext}
                  onChange={(e) => handleStatChange(idx, 'subtext', e.target.value)}
                  placeholder="Production engineering"
                  className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRemoveStat(idx)}
                className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition-colors self-end sm:self-center cursor-pointer"
                title="Remove Metric"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
