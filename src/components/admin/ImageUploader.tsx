import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onOpenMediaLibrary?: () => void;
  placeholder?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  helperText?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  onOpenMediaLibrary,
  placeholder = '/images/...',
  aspectRatio = 'square',
  helperText = 'Supports JPG, PNG, WebP up to 15MB',
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i)) {
      setError('Invalid format. Please select a JPG, JPEG, PNG, or WebP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setError('Image exceeds 15MB limit. Please upload a smaller file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploading(true);

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
          throw new Error(errData.error || 'Failed to upload image to server');
        }

        const data = await res.json();
        if (data.asset?.url) {
          onChange(data.asset.url);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      };
      reader.onerror = () => {
        throw new Error('Could not read image file.');
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'video': return 'aspect-[16/9] w-36';
      case 'wide': return 'aspect-[21/9] w-48';
      case 'auto': return 'w-24 h-24';
      default: return 'w-20 h-20';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
          {label}
        </label>
        {onOpenMediaLibrary && (
          <button
            type="button"
            onClick={onOpenMediaLibrary}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Select from Library</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Visual Preview */}
        <div
          className={`${getAspectClass()} rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shrink-0 relative group shadow-inner`}
        >
          {value ? (
            <>
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero_portrait_1792149624424.jpg';
                }}
              />
              <button
                type="button"
                onClick={() => onChange('')}
                title="Remove image"
                className="absolute top-1 right-1 p-1 bg-black/80 text-slate-400 hover:text-rose-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600 gap-1 p-2 text-center">
              <ImageIcon className="w-6 h-6" />
              <span className="text-[10px] font-mono">No Image</span>
            </div>
          )}
        </div>

        {/* Input & Direct Upload Button */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
              className="hidden"
              id={`file-input-${label.replace(/[^a-z0-9]/gi, '_')}`}
            />

            <label
              htmlFor={`file-input-${label.replace(/[^a-z0-9]/gi, '_')}`}
              className="px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload File</span>
                </>
              )}
            </label>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>{helperText}</span>
            {success && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Uploaded & applied!</span>
              </span>
            )}
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
