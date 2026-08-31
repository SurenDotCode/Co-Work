'use client';

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock,
  FileSpreadsheet,
  FileCode2,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  BellRing,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { Task, Member, Submission, DeliverableType } from '@/lib/types';
import { formatTimeRemaining, formatDateTime, playNotificationSound } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  roomCode: string;
  currentMemberId: string;
  currentMemberName: string;
  isHostOrCoHost: boolean;
  members: Member[];
  onTaskUpdated: () => void;
  onPreviewExcel: (submission: Submission, taskTitle: string) => void;
  onOpenNudge: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  roomCode,
  currentMemberId,
  currentMemberName,
  isHostOrCoHost,
  members,
  onTaskUpdated,
  onPreviewExcel,
  onOpenNudge,
}) => {
  const [timeInfo, setTimeInfo] = useState(() => formatTimeRemaining(task.dueDateTime));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live countdown timer updater
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(formatTimeRemaining(task.dueDateTime));
    }, 10000);
    return () => clearInterval(timer);
  }, [task.dueDateTime]);

  // Assigned members logic
  const assignedMemberIds = task.assignedTo === 'ALL'
    ? members.map((m) => m.id)
    : task.assignedTo;

  const totalAssigned = assignedMemberIds.length;
  const submissionsCount = Object.keys(task.submissions).length;
  const isAssignedToMe = assignedMemberIds.includes(currentMemberId);
  const mySubmission = task.submissions[currentMemberId];
  const completionPercentage = totalAssigned > 0 ? Math.round((submissionsCount / totalAssigned) * 100) : 0;

  const getDeliverableIcon = (type: DeliverableType) => {
    switch (type) {
      case 'EXCEL':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'CAD_DIE':
        return <FileCode2 className="w-4 h-4 text-blue-400" />;
      case 'PDF':
        return <FileText className="w-4 h-4 text-rose-400" />;
      default:
        return <FileText className="w-4 h-4 text-purple-400" />;
    }
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'URGENT':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            🚨 URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      case 'NORMAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            LOW
          </span>
        );
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !uploadNote) return;

    setIsUploading(true);
    const fileName = selectedFile
      ? selectedFile.name
      : `${currentMemberName.replace(/\s+/g, '_')}_${task.title.replace(/\s+/g, '_').slice(0, 20)}.xlsx`;

    try {
      const res = await fetch(`/api/rooms/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          memberId: currentMemberId,
          fileName,
          fileSize: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : '2.4 MB',
          fileType: task.deliverableType,
          notes: uploadNote || 'Verified engineering calculations & tolerances.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit file.');
      }

      // Celebratory feedback
      playNotificationSound();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });

      setSelectedFile(null);
      setUploadNote('');
      onTaskUpdated();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm(`Are you sure you want to remove the deadline for "${task.title}"?`)) return;
    try {
      const res = await fetch(`/api/rooms/${roomCode}/tasks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task.id,
          actorId: currentMemberId,
        }),
      });
      if (res.ok) {
        onTaskUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={`rounded-2xl glass-panel transition-all duration-300 overflow-hidden ${
        timeInfo.isOverdue
          ? 'border-rose-500/50 shadow-lg shadow-rose-500/10'
          : timeInfo.isUrgent
          ? 'border-amber-500/50 shadow-lg shadow-amber-500/10'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Top Banner Status Bar */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200">
              {getDeliverableIcon(task.deliverableType)}
              <span>{task.deliverableType.replace('_', ' ')}</span>
            </span>
            {getPriorityBadge(task.priority)}

            {/* Countdown Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-tight ${
                timeInfo.isOverdue
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                  : timeInfo.isUrgent
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {timeInfo.text}
            </span>
          </div>

          {/* Quick Host Controls */}
          {isHostOrCoHost && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={() => onOpenNudge(task.id)}
                title="Ping members who have not submitted yet"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Nudge Pending</span>
              </button>
              <button
                onClick={handleDeleteTask}
                title="Delete Deadline"
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Task Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
            <span>Assigned by: <strong className="text-slate-200">{task.createdBy.name}</strong></span>
            <span>•</span>
            <span>Target: <strong className="text-slate-200">{task.assignedTo === 'ALL' ? 'All Team Members' : `${assignedMemberIds.length} Members`}</strong></span>
            <span>•</span>
            <span>Due: <strong className="text-slate-200">{formatDateTime(task.dueDateTime)}</strong></span>
          </div>
        </div>

        {/* Progress Bar & Submission Stats */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              Submissions Compliance
            </span>
            <span className="font-mono font-bold text-white">
              <span className="text-emerald-400">{submissionsCount}</span> / {totalAssigned} Submitted ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completionPercentage === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : completionPercentage > 50
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-400'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Member View: My Submission Box */}
        {isAssignedToMe && (
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Your Submission Status:
              </span>
              {mySubmission ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Submitted & Signed Off
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Pending Upload
                </span>
              )}
            </div>

            {mySubmission ? (
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-mono font-bold text-white truncate">
                      {mySubmission.fileName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {mySubmission.fileSize} • Uploaded at {formatDateTime(mySubmission.uploadedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewExcel(mySubmission, task.title)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Sheet</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFileUpload} className="space-y-2.5">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500/80 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-blue-500/5 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <UploadCloud className="w-6 h-6 mx-auto text-slate-400 group-hover:text-blue-400 transition-colors mb-1.5" />
                  <div className="text-xs font-semibold text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click to Browse File or Drag & Drop'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Supports .xlsx, .csv, .step, .pdf, CAD mold drawings (Up to 50MB)
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add engineering notes / revision comments (optional)..."
                    value={uploadNote}
                    onChange={(e) => setUploadNote(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-white placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Submitting...' : 'Upload & Deliver'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Expand / Collapse Submissions Matrix */}
        <div className="border-t border-slate-800/80 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
          >
            <span className="font-semibold flex items-center gap-1.5">
              <span>View Team Submission Breakdown ({submissionsCount} of {totalAssigned})</span>
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-200">
              <div className="divide-y divide-slate-800/60 rounded-xl bg-slate-950/60 border border-slate-800/80 p-2">
                {assignedMemberIds.map((mId) => {
                  const member = members.find((m) => m.id === mId);
                  const sub = task.submissions[mId];

                  return (
                    <div
                      key={mId}
                      className="py-2 px-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{member?.avatar || '👤'}</span>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-200 truncate block">
                            {member?.name || 'Engineer'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {member?.department || 'Department'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub ? (
                          <div className="flex items-center gap-2">
                            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-300 max-w-[140px] truncate">
                              {sub.fileName}
                            </span>
                            <button
                              onClick={() => onPreviewExcel(sub, task.title)}
                              className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-500/25 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-semibold">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
