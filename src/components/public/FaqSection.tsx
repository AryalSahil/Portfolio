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
    .filter((f) => f.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedItems.length === 0) return null;

  const categories = ['All', ...Array.from(new Set(publishedItems.map((f) => f.category).filter(Boolean)))];

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
            Helpful answers to common questions about availability, collaborations, and projects.
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
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {categories.length > 2 && (
            <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start sm:self-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No matching questions found.
            </div>
          ) : (
            filtered.map((item) => {
              const isOpen = openIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-800 bg-[#0e1017] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleOpen(item.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                  >
                    <span className="font-semibold text-white text-sm sm:text-base">
                      {item.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
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
