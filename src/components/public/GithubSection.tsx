import React from 'react';
import { GithubActivity } from '../../types/portfolio.js';
import { Github, Star, GitFork, Activity, ExternalLink, Code2 } from 'lucide-react';

interface GithubSectionProps {
  activity: GithubActivity;
}

export const GithubSection: React.FC<GithubSectionProps> = ({ activity }) => {
  if (!activity || !activity.username || !activity.username.trim()) return null;

  return (
    <section id="github" className="py-24 border-t border-slate-800/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono uppercase tracking-widest font-semibold">
              <Github className="w-4 h-4" />
              <span>Open Source Activity</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Developer Ecosystem & GitHub
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Open-source repositories, developer contributions, and software projects.
            </p>
          </div>

          <a
            href={`https://github.com/${activity.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer w-fit shadow-md font-mono"
          >
            <Github className="w-4 h-4" />
            <span>@{activity.username} on GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* GitHub Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl border border-slate-800 bg-[#0e1017]">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activity.contributionsThisYear ?? 0}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contributions This Year</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activity.totalRepos ?? 0}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Public Repositories</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activity.followers ?? 0}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>GitHub Followers</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{activity.publicGists ?? 0}</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-sky-400" />
              <span>Public Gists</span>
            </div>
          </div>
        </div>

        {/* Top Languages Distribution */}
        {activity.topLanguages && activity.topLanguages.length > 0 && (
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Language Frequency Distribution
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
              {activity.topLanguages.map((lang, i) => {
                const colors = ['bg-indigo-500', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];
                return (
                  <div
                    key={i}
                    className={`${colors[i % colors.length]} h-full transition-all`}
                    style={{ width: `${lang.percentage}%` }}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-1">
              {activity.topLanguages.map((lang, i) => {
                const dotColors = ['bg-indigo-500', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];
                return (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                    <span>{lang.name}</span>
                    <span className="text-slate-500 font-bold">{lang.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Repositories */}
        {activity.recentRepos && activity.recentRepos.length > 0 && (
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Featured Repositories
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activity.recentRepos.map((repo, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl border border-slate-800 bg-[#0e1017] hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {repo.name}
                      </span>
                      {repo.language && (
                        <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>{repo.stars}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5 text-slate-400" />
                        <span>{repo.forks}</span>
                      </span>
                    </div>

                    {repo.url && (
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>Code</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
