import React, { useState } from 'react';
import { ResumeManagement } from '../../types/portfolio.js';
import { FileText, Download, CheckCircle2, Loader2, ShieldCheck, Eye } from 'lucide-react';

interface ResumeSectionProps {
  resume: ResumeManagement;
}

export const ResumeSection: React.FC<ResumeSectionProps> = ({ resume }) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadCount, setDownloadCount] = useState<number>(resume?.totalDownloads || 142);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!resume || resume.allowDownload === false) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);

    try {
      const res = await fetch('/api/resume/download', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.totalDownloads) {
          setDownloadCount(data.totalDownloads);
        }
      }
    } catch {
      // Ignore background tracking failure
    }

    // Trigger download
    const link = document.createElement('a');
    link.href = resume.url || '/uploads/elena_vance_cv_2026.pdf';
    link.download = resume.fileName || 'Elena_Vance_Curriculum_Vitae_2026.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <section id="resume" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-3xl border border-slate-800 bg-gradient-to-b from-[#11131c] to-[#0a0b10] shadow-2xl relative overflow-hidden">
          {/* Subtle ambient light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
                <FileText className="w-4 h-4" />
                <span>Verified Curriculum Vitae</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Download Comprehensive Resume & CV
              </h2>

              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                Detailed 4-page technical dossier covering architectural patents, distributed systems scale metrics, full employment timeline, and engineering leadership contributions.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-2">
                <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PDF Format (Print & ATS-Optimized)</span>
                </span>
                <span className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>{downloadCount} Verified Downloads</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end justify-center gap-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-6 py-4 rounded-xl text-sm font-bold text-slate-950 bg-white hover:bg-slate-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-indigo-500/20 disabled:bg-slate-700 disabled:text-slate-400"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                    <span>Preparing Download...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Download Started!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-900" />
                    <span>Download Resume (PDF)</span>
                  </>
                )}
              </button>

              <div className="text-center lg:text-right text-[11px] text-slate-500 font-mono">
                Last updated: {new Date(resume.lastUpdated || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
