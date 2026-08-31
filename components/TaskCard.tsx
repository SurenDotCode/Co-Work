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
  User,
  Users
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(formatTimeRemaining(task.dueDateTime));
    }, 10000);
    return () => clearInterval(timer);
  }, [task.dueDateTime]);

  // Assigned members logic (Individual vs Group)
  const isAssignedToAll = task.assignedTo === 'ALL';
  const assignedMemberIds = isAssignedToAll
    ? members.map((m) => m.id)
    : Array.isArray(task.assignedTo)
    ? task.assignedTo
    : [];

  const totalAssigned = assignedMemberIds.length;
  const submissionsCount = assignedMemberIds.filter((mId) => !!task.submissions[mId]).length;
  const isAssignedToMe = assignedMemberIds.includes(currentMemberId);
  const mySubmission = task.submissions[currentMemberId];
  const completionPercentage = totalAssigned > 0 ? Math.round((submissionsCount / totalAssigned) * 100) : 0;

  // Formatting assigned target text
  const getAssignedTargetLabel = () => {
    if (isAssignedToAll) return 'All Room Members';
    if (assignedMemberIds.length === 1) {
      const targetMember = members.find((m) => m.id === assignedMemberIds[0]);
      return targetMember ? targetMember.name : '1 Member';
    }
    return `${assignedMemberIds.length} Members`;
  };

  const getDeliverableIcon = (type: DeliverableType) => {
    switch (type) {
      case 'EXCEL':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CAD_DIE':
        return <FileCode2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'PDF':
        return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
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

      playNotificationSound();
      confetti({
        particleCount: 70,
        spread: 50,
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
    if (!confirm(`Remove deadline for "${task.title}"?`)) return;
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
      className={`rounded-xl panel p-5 space-y-4 transition-colors ${
        timeInfo.isOverdue
          ? 'border-red-900/60 bg-[#140e10]'
          : 'border-[#222226] bg-[#111114]'
      }`}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#18181c] border border-[#2c2c34] text-[11px] font-medium text-neutral-300">
            {getDeliverableIcon(task.deliverableType)}
            <span>{task.deliverableType.replace('_', ' ')}</span>
          </span>

          {/* Assigned target badge */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#18181c] border border-[#2c2c34] text-[11px] font-medium text-blue-300">
            {isAssignedToAll ? <Users className="w-3 h-3 text-neutral-400" /> : <User className="w-3 h-3 text-blue-400" />}
            <span>Assigned: {getAssignedTargetLabel()}</span>
          </span>

          {/* Countdown Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium ${
              timeInfo.isOverdue
                ? 'bg-red-950/40 text-red-400 border border-red-800/60'
                : timeInfo.isUrgent
                ? 'bg-amber-950/40 text-amber-400 border border-amber-800/60'
                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
            }`}
          >
            <Clock className="w-3 h-3" />
            {timeInfo.text}
          </span>
        </div>

        {/* Host Controls */}
        {isHostOrCoHost && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenNudge(task.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-[#1c1c22] hover:bg-[#25252e] text-neutral-300 border border-[#2e2e38] transition-colors cursor-pointer"
            >
              <BellRing className="w-3 h-3 text-amber-400" />
              <span>Nudge</span>
            </button>
            <button
              onClick={handleDeleteTask}
              className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
              title="Delete Deadline"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Task Details */}
      <div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-neutral-500">
          <span>By: {task.createdBy.name}</span>
          <span>•</span>
          <span>Due: {formatDateTime(task.dueDateTime)}</span>
        </div>
      </div>

      {/* Progress Compliance Bar */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400 font-medium">
            Submissions: {submissionsCount} of {totalAssigned} Received
          </span>
          <span className="font-mono text-neutral-300 font-medium">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#1e1e24] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completionPercentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Member View: My Submission Area */}
      {isAssignedToMe && (
        <div className="p-3.5 rounded-lg bg-[#0c0c0e] border border-[#222226] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-300">
              Your Deliverable:
            </span>
            {mySubmission ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Pending Upload
              </span>
            )}
          </div>

          {mySubmission ? (
            <div className="p-2.5 rounded-md bg-[#141418] border border-[#24242a] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-mono font-medium text-white truncate">
                    {mySubmission.fileName}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {mySubmission.fileSize} • Uploaded {formatDateTime(mySubmission.uploadedAt)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPreviewExcel(mySubmission, task.title)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[#1f1f26] hover:bg-[#272732] text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#2f2f38] hover:border-neutral-500 rounded-lg p-3 text-center cursor-pointer transition-colors bg-[#111114]"
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
                <UploadCloud className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                <div className="text-xs font-medium text-neutral-200">
                  {selectedFile ? selectedFile.name : 'Select or drop required spreadsheet/document'}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Notes or comments (optional)..."
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-md input-minimal text-xs text-white"
                />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Submit'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Expand / Collapse Submissions Breakdown */}
      <div className="border-t border-[#202024] pt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 transition-colors py-1 cursor-pointer"
        >
          <span className="font-medium">
            View Assignees &amp; Submissions ({submissionsCount}/{totalAssigned})
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isExpanded && (
          <div className="mt-2 divide-y divide-[#1e1e24] rounded-lg bg-[#0c0c0e] border border-[#202024] p-2">
            {assignedMemberIds.map((mId) => {
              const member = members.find((m) => m.id === mId);
              const sub = task.submissions[mId];

              return (
                <div
                  key={mId}
                  className="py-1.5 px-2 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs">{member?.avatar || '👤'}</span>
                    <div className="min-w-0">
                      <span className="font-medium text-neutral-200 truncate block text-xs">
                        {member?.name || 'Engineer'}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {member?.department || 'Department'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {sub ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-400 max-w-[120px] truncate hidden sm:inline-block">
                          {sub.fileName}
                        </span>
                        <button
                          onClick={() => onPreviewExcel(sub, task.title)}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[10px] font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
