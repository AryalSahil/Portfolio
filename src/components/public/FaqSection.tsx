import React, { useState } from 'react';
import { FaqItem } from '../../types/portfolio.js';
import { HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FaqSectionProps {
  faq: FaqItem[];
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faq }) => {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const publishedItems = (faq || [])
    .filter((f) => f.isPublished)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  const categories = ['All', ...Array.from(new Set(publishedItems.map((f) => f.category)))];

  const filtered = publishedItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-10">
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <HelpCircle className="w-4 h-4" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Clarifications on advisory availability, systems architecture philosophy, technology stack choices, and keynote engagements.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#0e1017] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500 font-mono">
              No matching questions found. Feel free to send a message via the Contact section below.
            </div>
          ) : (
            filtered.map((item) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-[#0e1017] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleOpen(item.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/50 transition-colors"
                  >
                    <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                      {item.question}
                    </span>
                    <span className="p-1 rounded-md text-slate-400 hover:text-white shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 font-sans">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
