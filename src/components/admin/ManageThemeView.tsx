import React, { useState, useEffect } from 'react';
import { WebsiteSettings } from '../../types/portfolio.js';
import { Palette, Save, CheckCircle2, AlertCircle, Loader2, Sparkles, Key, Sun, Moon } from 'lucide-react';

interface ManageThemeViewProps {
  settings: WebsiteSettings;
  onSave: (settings: WebsiteSettings) => Promise<void>;
}

export const ManageThemeView: React.FC<ManageThemeViewProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<WebsiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const colorPresets = [
    { name: 'Indigo & Sky (Default)', primary: '#6366f1', accent: '#38bdf8' },
    { name: 'Violet & Emerald', primary: '#8b5cf6', accent: '#10b981' },
    { name: 'Cyan & Amber', primary: '#06b6d4', accent: '#f59e0b' },
    { name: 'Rose & Violet', primary: '#f43f5e', accent: '#a855f7' },
    { name: 'Emerald & Teal', primary: '#10b981', accent: '#14b8a6' },
    { name: 'Monochrome Silver', primary: '#f8fafc', accent: '#94a3b8' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(formData);
      setFeedback({ type: 'success', message: 'Theme and appearance saved successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save theme' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Theme, Palette & Visual Appearance</h3>
          <p className="text-xs text-slate-400">Configure visual accents, primary color tokens, and preview bypass credentials</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          <span>Save Changes</span>
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

      {/* Preset Palettes */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-4">
        <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
          Curated Design System Palettes
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {colorPresets.map((preset) => {
            const isSelected = formData.primaryColor === preset.primary && formData.accentColor === preset.accent;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, primaryColor: preset.primary, accentColor: preset.accent }))}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex -space-x-2">
                  <span className="w-6 h-6 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: preset.primary }} />
                  <span className="w-6 h-6 rounded-full border border-slate-900 shadow-sm" style={{ backgroundColor: preset.accent }} />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-white truncate">{preset.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">{preset.primary}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Color Codes */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-5">
        <h4 className="text-sm font-bold text-white tracking-tight border-b border-slate-800 pb-3">
          Custom Brand Hex Codes
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-400">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primaryColor || '#6366f1'}
                onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={formData.primaryColor || '#6366f1'}
                onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-slate-400">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.accentColor || '#38bdf8'}
                onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={formData.accentColor || '#38bdf8'}
                onChange={(e) => setFormData((prev) => ({ ...prev, accentColor: e.target.value }))}
                className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <label className="text-xs font-mono uppercase text-slate-400">Theme Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {(['dark', 'light', 'system'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, themeMode: mode }))}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer capitalize text-xs font-semibold ${
                  formData.themeMode === mode
                    ? 'border-indigo-500 bg-indigo-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'dark' ? 'Dark Mode (OLED)' : mode === 'light' ? 'Light Mode' : 'System Auto'}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 space-y-1.5 border-t border-slate-800/80">
          <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>Private Preview Access Token</span>
          </label>
          <input
            type="text"
            value={formData.previewToken || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, previewToken: e.target.value }))}
            placeholder="preview_secret_token"
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
          />
          <p className="text-[11px] text-slate-500 font-mono">
            Visiting <code>/?preview={formData.previewToken}</code> unlocks unpublished draft modules and bypasses maintenance mode.
          </p>
        </div>
      </div>
    </form>
  );
};
