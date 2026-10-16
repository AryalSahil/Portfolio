import React, { useState } from 'react';
import { HeaderFooterConfig, NavItem } from '../../types/portfolio.js';
import { Save, CheckCircle2, AlertCircle, Loader2, ArrowUp, ArrowDown } from 'lucide-react';

interface ManageHeaderFooterViewProps {
  initialConfig: HeaderFooterConfig;
  onSave: (config: HeaderFooterConfig) => Promise<void>;
}

export const ManageHeaderFooterView: React.FC<ManageHeaderFooterViewProps> = ({ initialConfig, onSave }) => {
  const [formData, setFormData] = useState<HeaderFooterConfig>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleNavLabelChange = (index: number, label: string) => {
    const updated = [...formData.navItems];
    updated[index] = { ...updated[index], label };
    setFormData((prev) => ({ ...prev, navItems: updated }));
  };

  const handleNavVisibilityChange = (index: number, isVisible: boolean) => {
    const updated = [...formData.navItems];
    updated[index] = { ...updated[index], isVisible };
    setFormData((prev) => ({ ...prev, navItems: updated }));
  };

  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= formData.navItems.length) return;
    const copy = [...formData.navItems];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    // reset orders
    copy.forEach((item, i) => {
      item.order = i + 1;
    });
    setFormData((prev) => ({ ...prev, navItems: copy }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(formData);
      setFeedback({ type: 'success', message: 'Header and footer layout updated successfully.' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update configuration.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/60 sticky top-20 z-20 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Header & Footer Global Architecture</h3>
          <p className="text-xs text-slate-400">Navigation link labels, copyright notice, and branding</p>
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
              <span>Save Configuration</span>
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

      {/* Brand Identity */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
          Top Navigation Brand Lockup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Brand / Portfolio Name *</label>
            <input
              type="text"
              value={formData.brandName}
              onChange={(e) => setFormData((prev) => ({ ...prev, brandName: e.target.value }))}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Custom Logo URL (Optional)</label>
            <input
              type="text"
              value={formData.logoUrl || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, logoUrl: e.target.value }))}
              placeholder="Leave empty for minimal dot icon"
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Navigation Links Management */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="space-y-1 border-b border-slate-800/80 pb-3">
          <h3 className="text-base font-bold text-white tracking-tight">Navigation Links (Home, About, Work, Contact)</h3>
          <p className="text-xs text-slate-400">
            Customize menu labels, reorder sequencing, and toggle visibility.
          </p>
        </div>

        <div className="space-y-3">
          {formData.navItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/30 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5 text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleMoveNav(idx, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveNav(idx, 'down')}
                    disabled={idx === formData.navItems.length - 1}
                    className="p-0.5 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{item.href}</span>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleNavLabelChange(idx, e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={item.isVisible}
                  onChange={(e) => handleNavVisibilityChange(idx, e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Visible</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Content */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight border-b border-slate-800/80 pb-3">
          Footer Text & Copyright
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Footer Mission Statement / Summary</label>
            <textarea
              rows={2}
              value={formData.footerText}
              onChange={(e) => setFormData((prev) => ({ ...prev, footerText: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Copyright Line</label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={(e) => setFormData((prev) => ({ ...prev, copyrightText: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.showSocialInFooter}
                onChange={(e) => setFormData((prev) => ({ ...prev, showSocialInFooter: e.target.checked }))}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Display Social Media Icons in Footer</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
