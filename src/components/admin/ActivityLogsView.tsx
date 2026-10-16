import React, { useState } from 'react';
import { ActivityLog } from '../../types/portfolio.js';
import { FileText, Clock, Search, ShieldCheck } from 'lucide-react';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ logs }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0e1017] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Audit Trail & Security Event Logs</h3>
            <p className="text-xs text-slate-400">Append-only administrative logs recorded to server storage</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action or details..."
            className="pl-9 pr-4 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1017] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 font-mono">
            No activity log entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action Event</th>
                  <th className="px-5 py-3">Details & Parameters</th>
                  <th className="px-5 py-3">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-indigo-300 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300 max-w-md break-words">
                      {log.details}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {log.adminName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
