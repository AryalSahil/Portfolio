import React from 'react';
import { TestimonialItem } from '../../types/portfolio.js';
import { MessageSquare, Star, Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ testimonials }) => {
  const publishedItems = (testimonials || [])
    .filter((t) => t.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <MessageSquare className="w-4 h-4" />
            <span>Endorsements</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Client & Peer Testimonials
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Recommendations and reviews from project partners, collaborators, and clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedItems.map((item) => (
            <div
              key={item.id}
              className="p-8 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all flex flex-col justify-between space-y-6 shadow-xl relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-indigo-500/30 group-hover:text-indigo-500/60 transition-colors" />
                </div>

                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{item.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                {item.avatarUrl ? (
                  <img
                    src={item.avatarUrl}
                    alt={item.clientName}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {item.clientName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white tracking-tight truncate">
                    {item.clientName}
                  </div>
                  {(item.clientRole || item.clientCompany) && (
                    <div className="text-xs text-slate-400 truncate">
                      {item.clientRole}{item.clientRole && item.clientCompany ? ', ' : ''}{item.clientCompany}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
