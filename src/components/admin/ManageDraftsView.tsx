import React, { useState } from 'react';
import { PortfolioData } from '../../types/portfolio.js';
import { Layers, Eye, CheckCircle2, AlertCircle, Loader2, Sparkles, Filter, ExternalLink } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageDraftsViewProps {
  data: PortfolioData;
  onRefresh: () => Promise<void>;
  onPreviewSite: () => void;
}

export const ManageDraftsView: React.FC<ManageDraftsViewProps> = ({ data, onRefresh, onPreviewSite }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Aggregate all publishable entities
  interface PublishableItem {
    id: string;
    type: 'Project' | 'Article' | 'Experience' | 'Service' | 'Testimonial' | 'FAQ';
    endpoint: string;
    title: string;
    isPublished: boolean;
  }

  const items: PublishableItem[] = [
    ...(data.projects || []).map((p) => ({
      id: p.id,
      type: 'Project' as const,
      endpoint: `/api/admin/projects/${p.id}`,
      title: p.title,
      isPublished: Boolean(p.isPublished),
    })),
    ...(data.blog || []).map((b) => ({
      id: b.id,
      type: 'Article' as const,
      endpoint: `/api/admin/blog/${b.id}`,
      title: b.title,
      isPublished: Boolean(b.isPublished),
    })),
    ...(data.experience || []).map((e) => ({
      id: e.id,
      type: 'Experience' as const,
      endpoint: `/api/admin/experience/${e.id}`,
      title: `${e.role} at ${e.company}`,
      isPublished: Boolean(e.isPublished),
    })),
    ...(data.services || []).map((s) => ({
      id: s.id,
      type: 'Service' as const,
      endpoint: `/api/admin/services/${s.id}`,
      title: s.title,
      isPublished: Boolean(s.isPublished),
    })),
    ...(data.testimonials || []).map((t) => ({
      id: t.id,
      type: 'Testimonial' as const,
      endpoint: `/api/admin/testimonials/${t.id}`,
      title: `${t.clientName} (${t.clientCompany})`,
      isPublished: Boolean(t.isPublished),
    })),
    ...(data.faq || []).map((f) => ({
      id: f.id,
      type: 'FAQ' as const,
      endpoint: `/api/admin/faq/${f.id}`,
      title: f.question,
      isPublished: Boolean(f.isPublished),
    })),
  ];

  const filtered = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus === 'published' && !item.isPublished) return false;
    if (filterStatus === 'draft' && item.isPublished) return false;
    return true;
  });

  const totalPublished = items.filter((i) => i.isPublished).length;
  const totalDraft = items.length - totalPublished;

  const handleToggle = async (item: PublishableItem) => {
    setUpdatingId(item.id);
    try {
      const res = await authFetch(item.endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      if (!res.ok) throw new Error('Status update failed');
      await onRefresh();
      setFeedback(`Updated status for "${item.title}" to ${!item.isPublished ? 'Published' : 'Draft'}.`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Drafts & Publishing Control Center</h3>
          <p className="text-xs text-slate-400">Centrally monitor, publish, unpublish, or stage content across all sections</p>
        </div>
        <button
          onClick={onPreviewSite}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span>Preview Live Website</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-xs sm:text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] space-y-1">
          <div className="text-2xl font-bold text-white font-mono">{items.length}</div>
          <div className="text-xs text-slate-400">Total Authorable Items</div>
        </div>
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] space-y-1">
          <div className="text-2xl font-bold text-emerald-400 font-mono">{totalPublished}</div>
          <div className="text-xs text-slate-400">Live & Published Items</div>
        </div>
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] space-y-1">
          <div className="text-2xl font-bold text-amber-400 font-mono">{totalDraft}</div>
          <div className="text-xs text-slate-400">Draft / Unpublished Items</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div className="flex flex-wrap gap-2">
          {['all', 'Project', 'Article', 'Experience', 'Service', 'Testimonial', 'FAQ'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                filterType === t ? 'bg-white text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t === 'all' ? 'All Types' : `${t}s`}
            </button>
          ))}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-900 text-slate-400'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === 'published' ? 'bg-emerald-600 text-white font-semibold' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === 'draft' ? 'bg-amber-600 text-white font-semibold' : 'bg-slate-900 text-slate-400'
            }`}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Master List */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const isBusy = updatingId === item.id;
          return (
            <div
              key={`${item.type}-${item.id}`}
              className="p-4 rounded-xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-slate-900 border border-slate-800 text-indigo-400 shrink-0">
                  {item.type}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
                    item.isPublished
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {item.isPublished ? 'Published' : 'Draft'}
                </span>

                <button
                  onClick={() => handleToggle(item)}
                  disabled={isBusy}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                    item.isPublished
                      ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                      : 'bg-white hover:bg-slate-200 text-slate-950 font-bold shadow-sm'
                  }`}
                >
                  {isBusy ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : item.isPublished ? (
                    'Unpublish'
                  ) : (
                    'Publish Live'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
