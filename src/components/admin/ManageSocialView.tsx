import React, { useState } from 'react';
import { SocialLink } from '../../types/portfolio.js';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Globe
} from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageSocialViewProps {
  socialLinks: SocialLink[];
  onRefresh: () => Promise<void>;
}

export const ManageSocialView: React.FC<ManageSocialViewProps> = ({ socialLinks, onRefresh }) => {
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const platforms = ['GitHub', 'LinkedIn', 'X', 'YouTube', 'Instagram', 'Facebook', 'Custom'] as const;

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'x':
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const handleOpenNew = () => {
    setIsNew(true);
    setEditingLink({
      platform: 'GitHub',
      label: 'GitHub',
      url: 'https://github.com/',
      isEnabled: true,
    });
  };

  const handleOpenEdit = (l: SocialLink) => {
    setIsNew(false);
    setEditingLink({ ...l });
  };

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Delete social link for "${label}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/social-links/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: `Removed "${label}".` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleEnable = async (l: SocialLink) => {
    try {
      const res = await authFetch(`/api/admin/social-links/${l.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: !l.isEnabled }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= socialLinks.length) return;

    const copy = [...socialLinks];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Save orders sequentially
    for (let i = 0; i < copy.length; i++) {
      await authFetch(`/api/admin/social-links/${copy[i].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: i + 1 }),
      });
    }
    await onRefresh();
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink?.label || !editingLink?.url) {
      alert('Label and URL are required.');
      return;
    }

    // URL validation
    if (!editingLink.url.startsWith('http://') && !editingLink.url.startsWith('https://')) {
      alert('URL must begin with http:// or https://');
      return;
    }

    try {
      let res;
      if (isNew) {
        res = await authFetch('/api/admin/social-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingLink),
        });
      } else {
        res = await authFetch(`/api/admin/social-links/${editingLink.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingLink),
        });
      }

      if (!res.ok) throw new Error('Save failed');
      await onRefresh();
      setEditingLink(null);
      setFeedback({ type: 'success', message: `Saved social link "${editingLink.label}".` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Social Profiles & External Networks</h3>
          <p className="text-xs text-slate-400">Manage social icons and outbound links on public site</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl text-xs sm:text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1017] overflow-hidden">
        <div className="divide-y divide-slate-800/80">
          {socialLinks.map((link, idx) => (
            <div
              key={link.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
            >
              <div className="flex items-center gap-4">
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
                    disabled={idx === socialLinks.length - 1}
                    className="p-0.5 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400">
                  {getPlatformIcon(link.platform)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white tracking-tight">{link.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {link.platform}
                    </span>
                    {!link.isEnabled && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        Disabled
                      </span>
                    )}
                  </div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 font-mono truncate max-w-sm"
                  >
                    <span>{link.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleEnable(link)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                    link.isEnabled
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-amber-400 bg-amber-400/10'
                  }`}
                >
                  {link.isEnabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleOpenEdit(link)}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(link.id, link.label)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className="w-full max-w-md bg-[#0d0f16] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isNew ? 'Add Social Profile' : `Edit: ${editingLink.label}`}
              </h3>
              <button
                onClick={() => setEditingLink(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Platform Preset</label>
                <select
                  value={editingLink.platform || 'GitHub'}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    setEditingLink({ ...editingLink, platform: p, label: editingLink.label || p });
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Display Label *</label>
                <input
                  type="text"
                  value={editingLink.label || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, label: e.target.value })}
                  required
                  placeholder="e.g. GitHub"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono uppercase text-slate-400">Target Profile URL *</label>
                <input
                  type="url"
                  value={editingLink.url || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  required
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingLink.isEnabled}
                    onChange={(e) => setEditingLink({ ...editingLink, isEnabled: e.target.checked })}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Active & Shown on Public Website</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
