import React, { useState } from 'react';
import { BlogPost } from '../../types/portfolio.js';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';
import { BlogModal } from './BlogModal.js';

interface BlogSectionProps {
  posts: BlogPost[];
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const publishedPosts = (posts || [])
    .filter((p) => p.isPublished !== false)
    .sort((a, b) => a.order - b.order);

  if (publishedPosts.length === 0) return null;

  return (
    <section id="blog" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
            <BookOpen className="w-4 h-4" />
            <span>Articles & Writing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Articles & Technical Insights
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Case studies, architectural deep-dives, and perspectives on engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 shadow-xl cursor-pointer group"
            >
              <div className="space-y-4">
                {post.coverImage && (
                  <div className="aspect-[16/9] w-full rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </span>
                  )}
                  {post.readTimeMinutes && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTimeMinutes} min read</span>
                      </span>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                {post.tags && post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((t, idx) => (
                      <span key={idx} className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : <span />}

                <span className="text-indigo-400 font-medium group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {selectedPost && (
        <BlogModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </section>
  );
};
