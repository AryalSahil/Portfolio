import React, { useState, useRef } from 'react';
import { MediaAsset } from '../../types/portfolio.js';
import {
  Upload,
  Copy,
  Check,
  Trash2,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface MediaLibraryViewProps {
  media: MediaAsset[];
  onRefresh: () => Promise<void>;
  onSelectUrl?: (url: string) => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({ media, onRefresh, onSelectUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('File exceeds 15MB limit.');
      return;
    }

    setUploading(true);
    setFeedback(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await authFetch('/api/admin/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            dataBase64: base64Data,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Upload failed');
        }

        await onRefresh();
        setFeedback({ type: 'success', message: `Uploaded "${file.name}" successfully.` });
        setTimeout(() => setFeedback(null), 3000);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Upload error' });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!window.confirm(`Permanently delete media "${asset.originalName}"?`)) return;
    try {
      const res = await authFetch(`/api/admin/media/${asset.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      await onRefresh();
      setFeedback({ type: 'success', message: `Deleted "${asset.originalName}".` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Upload Drop Zone / Header */}
      <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 bg-[#0e1017] flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500/50 transition-colors">
        <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400">
          <Upload className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white tracking-tight">Upload Images & Assets</h3>
          <p className="text-xs text-slate-400">PNG, JPG, SVG, WebP, or PDF up to 15MB</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept="image/*,application/pdf"
          className="hidden"
          id="media-file-input"
        />

        <label
          htmlFor="media-file-input"
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading to Storage...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              <span>Browse File to Upload</span>
            </>
          )}
        </label>
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

      {/* Media Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Total Assets: {media.length}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((asset) => {
            const isImage = asset.mimeType?.startsWith('image/') || asset.url.match(/\.(jpg|jpeg|png|webp|svg)$/i);
            const isCopied = copiedId === asset.id;

            return (
              <div
                key={asset.id}
                className="p-3 rounded-xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between group"
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-900 flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={asset.url}
                      alt={asset.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-500">
                      <FileText className="w-8 h-8 text-indigo-400" />
                      <span className="text-[10px] font-mono uppercase">{asset.mimeType.split('/')[1] || 'DOC'}</span>
                    </div>
                  )}

                  {onSelectUrl && (
                    <button
                      onClick={() => onSelectUrl(asset.url)}
                      className="absolute inset-0 bg-indigo-600/80 text-white font-semibold text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      Select Image
                    </button>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white truncate" title={asset.originalName}>
                    {asset.originalName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{formatFileSize(asset.size)}</span>
                    <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleCopyUrl(asset)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-500 hover:text-white rounded"
                      title="Open full file"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(asset)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
