'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Search, CheckCircle2, Clock, Eye, AlertTriangle } from 'lucide-react';
import { Room, Submission } from '@/lib/types';
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

    const pendingCount = room.tasks.filter((t) => {
      const isAssigned = t.assignedTo === 'ALL' || (Array.isArray(t.assignedTo) && t.assignedTo.includes(m.id));
      return isAssigned && !t.submissions[m.id];
    }).length;

    if (statusFilter === 'PENDING') return pendingCount > 0;
    if (statusFilter === 'COMPLETED') return pendingCount === 0;

    return true;
  });

  return (
    <div className="space-y-3">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search engineers by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg input-minimal text-xs text-white placeholder:text-neutral-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'COMPLETED' | 'PENDING')}
            className="px-2.5 py-1.5 rounded-lg input-minimal text-xs text-white bg-[#0c0c0e]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Uploads</option>
            <option value="COMPLETED">100% Submitted</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNudge}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1814] hover:bg-[#26221c] text-amber-300 border border-amber-900/60 transition-colors cursor-pointer"
          >
            ⚡ Nudge Pending
          </button>
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="rounded-xl panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#18181c] text-neutral-400 border-b border-[#222226]">
                <th className="p-3 font-semibold min-w-[180px]">Engineer</th>
                {room.tasks.map((task) => {
                  const time = formatTimeRemaining(task.dueDateTime);
                  return (
                    <th key={task.id} className="p-3 font-semibold min-w-[200px]">
                      <div className="font-semibold text-white truncate max-w-[180px]">{task.title}</div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span className={time.isOverdue ? 'text-red-400' : ''}>{time.text}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e24] text-neutral-300">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#141418] transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{member.avatar}</span>
                      <div>
                        <div className="font-semibold text-white text-xs">{member.name}</div>
                        <div className="text-[10px] text-neutral-500">
                          {member.department || 'Design Dept'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {room.tasks.map((task) => {
                    const isAssigned =
                      task.assignedTo === 'ALL' ||
                      (Array.isArray(task.assignedTo) && task.assignedTo.includes(member.id));
                    const submission = task.submissions[member.id];
                    const time = formatTimeRemaining(task.dueDateTime);

                    if (!isAssigned) {
                      return (
                        <td key={task.id} className="p-3 text-neutral-600 text-center">
                          <span className="text-[10px] text-neutral-600">Not Assigned</span>
                        </td>
                      );
                    }

                    if (submission) {
                      return (
                        <td key={task.id} className="p-3">
                          <div className="p-2 rounded-md bg-[#131b16] border border-emerald-900/50 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Submitted
                              </span>
                              <button
                                onClick={() => onPreviewExcel(submission, task.title)}
                                className="px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </div>
                            <div className="text-[10px] font-mono text-neutral-300 truncate" title={submission.fileName}>
                              {submission.fileName}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={task.id} className="p-3">
                        <div
                          className={`p-2 rounded-md border text-[10px] ${
                            time.isOverdue
                              ? 'bg-red-950/30 border-red-900/50 text-red-300'
                              : 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {time.isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                            <span className="font-mono text-[9px] opacity-75">{time.text}</span>
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
