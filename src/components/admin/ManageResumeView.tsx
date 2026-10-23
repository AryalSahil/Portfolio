import React, { useState, useEffect, useRef } from 'react';
import { ResumeManagement } from '../../types/portfolio.js';
import { FileText, Upload, Save, CheckCircle2, AlertCircle, Loader2, Download, Eye, Calendar, ShieldCheck } from 'lucide-react';
import { authFetch } from '../../utils/api.js';

interface ManageResumeViewProps {
  resume: ResumeManagement;
  onSave: (resume: ResumeManagement) => Promise<void>;
  onOpenMediaLibrary?: () => void;
}

export const ManageResumeView: React.FC<ManageResumeViewProps> = ({ resume, onSave, onOpenMediaLibrary }) => {
  const [formData, setFormData] = useState<ResumeManagement>(resume);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resume) {
      setFormData(resume);
    }
  }, [resume]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please select a valid PDF file for the Resume / CV.');
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
            mimeType: 'application/pdf',
            size: file.size,
            dataBase64: base64Data,
          }),
        });

        if (!res.ok) throw new Error('Upload failed');
        const result = await res.json();
        const newUrl = result.asset?.url;

        setFormData((prev) => ({
          ...prev,
          url: newUrl,
          fileName: file.name,
          lastUpdated: new Date().toISOString(),
        }));

        setFeedback({ type: 'success', message: `Resume file "${file.name}" uploaded successfully. Remember to click Save Changes.` });
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'File upload failed' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await onSave(formData);
      setFeedback({ type: 'success', message: 'Resume settings and file references updated successfully.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save resume settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-[#0e1017]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Curriculum Vitae & Resume Management</h3>
          <p className="text-xs text-slate-400">Upload PDF documents, toggle public downloading, and inspect download metrics</p>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] space-y-1">
          <div className="text-2xl font-bold text-white font-mono">{formData.totalDownloads || 0}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Total Verified Downloads</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] space-y-1">
          <div className="text-xs font-bold text-white font-mono truncate" title={formData.fileName}>
            {formData.fileName || 'No file uploaded'}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Document File</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-[#0e1017] space-y-1">
          <div className="text-xs font-bold text-white font-mono">
            {formData.lastUpdated ? new Date(formData.lastUpdated).toLocaleDateString() : 'Never'}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Last Updated</span>
          </div>
        </div>
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-5">
        <h4 className="text-sm font-bold text-white tracking-tight border-b border-slate-800 pb-3">
          Upload PDF File
        </h4>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
            id="resume-pdf-upload"
          />

          <label
            htmlFor="resume-pdf-upload"
            className="px-4 py-2.5 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-200 rounded-lg cursor-pointer transition-colors flex items-center gap-2 shrink-0 shadow-sm"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Document...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload New PDF</span>
              </>
            )}
          </label>

          <div className="flex-1 space-y-1">
            <input
              type="text"
              value={formData.url || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              placeholder="/uploads/my_resume.pdf"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 font-mono">Direct permanent storage path or external URL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400">Download File Name</label>
            <input
              type="text"
              value={formData.fileName || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, fileName: e.target.value }))}
              placeholder="Elena_Vance_Resume_2026.pdf"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowDownload !== false}
                onChange={(e) => setFormData((prev) => ({ ...prev, allowDownload: e.target.checked }))}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Allow public visitors to download resume</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
