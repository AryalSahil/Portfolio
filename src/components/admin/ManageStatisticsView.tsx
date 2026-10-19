import React, { useState, useEffect } from 'react';
import { HomeContent } from '../../types/portfolio.js';
import { Plus, Trash2, CheckCircle2, AlertCircle, Save, Loader2, BarChart2 } from 'lucide-react';

interface ManageStatisticsViewProps {
  home: HomeContent;
  onSave: (home: HomeContent) => Promise<void>;
}

export const ManageStatisticsView: React.FC<ManageStatisticsViewProps> = ({ home, onSave }) => {
  const [formData, setFormData] = useState<HomeContent>(home);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (home) {
      setFormData(home);
    }
  }, [home]);

  const handleStatChange = (index: number, field: string, val: string) => {
    const updated = [...(formData.stats || [])];
    updated[index] = { ...updated[index], [field]: val };
    setFormData((prev) => ({ ...prev, stats: updated }));
  };

  const handleAddStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { label: 'New Metric', value: '100+', subtext: 'Benchmark description' }],
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
      setFeedback({ type: 'success', message: 'Website metrics and KPI statistics saved successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save statistics' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Website Metrics & Impact Statistics</h3>
          <p className="text-xs text-slate-400">Configure key numeric indicators and benchmark cards displayed on the hero section</p>
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

      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.showStats !== false}
              onChange={(e) => setFormData((prev) => ({ ...prev, showStats: e.target.checked }))}
              className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-white">Display statistics strip on public website</span>
          </label>

          <button
            type="button"
            onClick={handleAddStat}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Statistic</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formData.stats || []).map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase">KPI #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStat(idx)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove KPI"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Metric Value *</label>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                    required
                    placeholder="250M+"
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400">Label Title *</label>
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                    required
                    placeholder="Global Traffic"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Subtext Context</label>
                <input
                  type="text"
                  value={stat.subtext}
                  onChange={(e) => handleStatChange(idx, 'subtext', e.target.value)}
                  placeholder="Monthly API requests"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
