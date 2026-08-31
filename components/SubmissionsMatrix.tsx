'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Search, CheckCircle2, Clock, Eye, AlertTriangle, Filter, Sparkles } from 'lucide-react';
import { Room, Member, Task, Submission } from '@/lib/types';
import { formatTimeRemaining } from '@/lib/utils';

interface SubmissionsMatrixProps {
  room: Room;
  onPreviewExcel: (submission: Submission, taskTitle: string) => void;
  onOpenExport: () => void;
  onOpenNudge: () => void;
}

export const SubmissionsMatrix: React.FC<SubmissionsMatrixProps> = ({
  room,
  onPreviewExcel,
  onOpenExport,
  onOpenNudge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  const filteredMembers = room.members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.empId && m.empId.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;

    // Check if member has pending tasks
    const pendingCount = room.tasks.filter((t) => {
      const isAssigned = t.assignedTo === 'ALL' || (Array.isArray(t.assignedTo) && t.assignedTo.includes(m.id));
      return isAssigned && !t.submissions[m.id];
    }).length;

    if (statusFilter === 'PENDING') return pendingCount > 0;
    if (statusFilter === 'COMPLETED') return pendingCount === 0;

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search engineers by name, dept, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500 focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>

          {/* Filter pill */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'COMPLETED' | 'PENDING')}
            className="px-3 py-2 rounded-xl glass-input text-xs text-white bg-slate-900 focus:border-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">With Pending Uploads</option>
            <option value="COMPLETED">100% Completed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNudge}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
          >
            ⚡ Nudge Pending
          </button>
          <button
            onClick={onOpenExport}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Master Grid</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="rounded-2xl glass-panel border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                <th className="p-3.5 font-bold min-w-[200px]">Engineer / Lead</th>
                {room.tasks.map((task) => {
                  const time = formatTimeRemaining(task.dueDateTime);
                  return (
                    <th key={task.id} className="p-3.5 font-semibold min-w-[220px]">
                      <div className="font-bold text-white truncate max-w-[200px]">{task.title}</div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span className={time.isOverdue ? 'text-rose-400 font-bold' : ''}>{time.text}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/40 transition-colors">
                  {/* Member Column */}
                  <td className="p-3.5 font-sans">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{member.avatar}</span>
                      <div>
                        <div className="font-bold text-white text-xs">{member.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {member.department || 'Design Dept'}
                          {member.empId && <span className="font-mono text-slate-500"> • {member.empId}</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Task Columns */}
                  {room.tasks.map((task) => {
                    const isAssigned =
                      task.assignedTo === 'ALL' ||
                      (Array.isArray(task.assignedTo) && task.assignedTo.includes(member.id));
                    const submission = task.submissions[member.id];
                    const time = formatTimeRemaining(task.dueDateTime);

                    if (!isAssigned) {
                      return (
                        <td key={task.id} className="p-3.5 text-slate-600 text-center">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/40 text-slate-500">
                            N/A
                          </span>
                        </td>
                      );
                    }

                    if (submission) {
                      return (
                        <td key={task.id} className="p-3.5">
                          <div className="p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Submitted
                              </span>
                              <button
                                onClick={() => onPreviewExcel(submission, task.title)}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-2.5 h-2.5" />
                                Inspect
                              </button>
                            </div>
                            <div className="text-[11px] font-mono text-slate-200 truncate" title={submission.fileName}>
                              {submission.fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {submission.fileSize}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={task.id} className="p-3.5">
                        <div
                          className={`p-2 rounded-xl border space-y-1 ${
                            time.isOverdue
                              ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                              : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {time.isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                            <span className="text-[9px] font-mono opacity-80">{time.text}</span>
                          </div>
                          <div className="text-[10px] opacity-75">
                            Awaiting file upload
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
