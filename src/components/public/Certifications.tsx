import React from 'react';
import { CertificationItem } from '../../types/portfolio.js';
import { ShieldCheck, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

interface CertificationsProps {
  certifications: CertificationItem[];
}

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  const publishedItems = (certifications || [])
    .filter((c) => c.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  return (
    <section id="certifications" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Accreditations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Professional Certifications
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Verified credentials, industry licenses, and technical accreditations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedItems.map((cert) => (
            <div
              key={cert.id}
              className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {cert.title}
                  </h3>
                  <div className="text-xs text-indigo-400/90 font-medium pt-1">
                    {cert.issuer}
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-400 font-mono pt-1">
                  {cert.issueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Issued: {cert.issueDate}</span>
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="text-slate-500 text-[11px] truncate">
                      ID: {cert.credentialId}
                    </div>
                  )}
                </div>
              </div>

              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium pt-3 border-t border-slate-800/80"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
