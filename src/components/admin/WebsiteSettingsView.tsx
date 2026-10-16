import React, { useState } from 'react';
import { WebsiteSettings, ModularSection } from '../../types/portfolio.js';
import { Save, CheckCircle2, AlertCircle, Loader2, ShieldAlert, Sparkles, Palette } from 'lucide-react';

interface WebsiteSettingsViewProps {
  initialSettings: WebsiteSettings;
  modularSections: ModularSection[];
  onSaveSettings: (settings: WebsiteSettings) => Promise<void>;
  onSaveModularSections: (sections: ModularSection[]) => Promise<void>;
}

export const WebsiteSettingsView: React.FC<WebsiteSettingsViewProps> = ({
  initialSettings,
  modularSections,
  onSaveSettings,
  onSaveModularSections,
}) => {
  const [settings, setSettings] = useState<WebsiteSettings>(initialSettings);
  const [sections, setSections] = useState<ModularSection[]>(modularSections);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleToggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSaveSettings(settings);
      await onSaveModularSections(sections);
      setFeedback({ type: 'success', message: 'Website settings and modular configuration saved successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 sticky top-20 z-20 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">System & Environment Settings</h3>
          <p className="text-xs text-slate-400">SEO meta descriptions, themes, and maintenance switches</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 disabled:bg-slate-700 disabled:text-slate-400 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </>
          )}
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

      {/* SEO & Meta */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
          Search Engine Optimization (SEO) & Metadata
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Global Website Title *</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Meta Description *</label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Contact Email Target</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Theme & Palette */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Theme & Visual Palette</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Primary Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-10 h-10 rounded border border-slate-800 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-32 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">Secondary Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-10 h-10 rounded border border-slate-800 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={settings.accentColor}
                onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                className="w-32 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Maintenance Mode Switch</h3>
            <p className="text-xs text-slate-400">Directs public visitors to a maintenance screen while allowing preview access via secret token</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span className="text-sm font-semibold text-white">
              Activate Maintenance Mode
            </span>
          </label>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Admin Preview Bypass Token
            </label>
            <input
              type="text"
              value={settings.previewToken}
              onChange={(e) => setSettings({ ...settings, previewToken: e.target.value })}
              className="w-full px-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded text-indigo-300 font-mono"
            />
            <p className="text-[11px] text-slate-500 font-mono">
              Use `/?preview={settings.previewToken}` to bypass the maintenance screen during staging tests.
            </p>
          </div>
        </div>
      </div>

      {/* Future Expansion Modular Sections */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Modular Section Architecture & Future Expansion</h3>
            <p className="text-xs text-slate-400">
              Initial portfolio displays Home, About, Work, and Contact. Enable additional modules when you want them to appear.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((sec) => {
            const isCore = ['home', 'about', 'work', 'contact'].includes(sec.slug);
            return (
              <div
                key={sec.id}
                className={`p-4 rounded-xl border transition-colors ${
                  sec.isEnabled
                    ? 'border-indigo-500/40 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{sec.name}</span>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sec.isEnabled}
                      disabled={isCore}
                      onChange={() => handleToggleSection(sec.id)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={sec.isEnabled ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>
                      {isCore ? 'Core (Active)' : sec.isEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-slate-400 mt-1">{sec.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </form>
  );
};
