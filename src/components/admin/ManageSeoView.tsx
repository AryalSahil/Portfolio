import React, { useState, useEffect } from 'react';
import { SeoMetadata } from '../../types/portfolio.js';
import { Globe, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ImageUploader } from './ImageUploader.js';

interface ManageSeoViewProps {
  seo: SeoMetadata;
  onSave: (seo: SeoMetadata) => Promise<void>;
  onOpenMediaLibrary?: () => void;
}

export const ManageSeoView: React.FC<ManageSeoViewProps> = ({ seo, onSave, onOpenMediaLibrary }) => {
  const [formData, setFormData] = useState<SeoMetadata>(seo);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (seo) {
      setFormData(seo);
      setKeywordsInput((seo.keywords || []).join(', '));
    }
  }, [seo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const keywords = keywordsInput.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = { ...formData, keywords };

    try {
      await onSave(payload);
      setFeedback({ type: 'success', message: 'SEO and social metadata saved successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save SEO metadata' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">SEO, OpenGraph & Social Sharing</h3>
          <p className="text-xs text-slate-400">Configure search engine titles, social sharing preview cards, and indexing keywords</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save SEO Settings</span>
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

      {/* Google Search Result Simulator */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-3">
        <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
          Search Engine Result Preview
        </div>
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950 space-y-1">
          <div className="text-xs text-slate-500 font-mono truncate">{formData.canonicalUrl || 'https://elena-vance.dev'}</div>
          <div className="text-base font-semibold text-indigo-400 hover:underline cursor-pointer">
            {formData.metaTitle || 'Elena Vance — Principal Product Engineer & Architect'}
          </div>
          <div className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {formData.metaDescription || 'Portfolio and selected works of Elena Vance, specialized in high-throughput cloud distributed systems...'}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400">Page Meta Title</label>
          <input
            type="text"
            value={formData.metaTitle || ''}
            onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
            required
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400">Meta Description</label>
          <textarea
            rows={3}
            value={formData.metaDescription || ''}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            required
            className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
          />
        </div>

        {/* OpenGraph Image Uploader */}
        <ImageUploader
          label="OpenGraph Social Share Card Image (1200x630)"
          value={formData.ogImage || ''}
          onChange={(url) => setFormData({ ...formData, ogImage: url })}
          onOpenMediaLibrary={onOpenMediaLibrary}
          placeholder="/images/hero_portrait_...jpg"
          aspectRatio="wide"
          helperText="Displayed when your portfolio link is shared on Twitter, LinkedIn, Slack, etc."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Canonical Website URL</label>
            <input
              type="url"
              value={formData.canonicalUrl || ''}
              onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              placeholder="https://elena-vance.dev"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Twitter Handle</label>
            <input
              type="text"
              value={formData.twitterHandle || ''}
              onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
              placeholder="@elena_vance_dev"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400">SEO Keywords (Comma-separated)</label>
          <input
            type="text"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="Principal Engineer, Systems Architect, TypeScript, React 19, Distributed Systems"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </form>
  );
};
