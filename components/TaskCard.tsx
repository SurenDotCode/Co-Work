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
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />;
      case 'CAD_DIE':
        return <FileCode2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'PDF':
        return <FileText className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-purple-600" />;
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
      className={`rounded-xl card-white p-5 space-y-4 transition-all ${
        timeInfo.isOverdue ? 'border-red-300 bg-red-50/20' : ''
      }`}
    >
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Deliverable format chip */}
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
            {getDeliverableIcon(task.deliverableType)}
            <span>{task.deliverableType.replace('_', ' ')}</span>
          </span>

          {/* Assigned Target Badge */}
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            {isAssignedToAll ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            <span>Assigned: {getAssignedTargetLabel()}</span>
          </span>

          {/* Countdown Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold ${
              timeInfo.isOverdue
                ? 'bg-red-50 text-red-700 border border-red-200 font-bold'
                : timeInfo.isUrgent
                ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {timeInfo.text}
          </span>
        </div>

        {/* Host Controls */}
        {isHostOrCoHost && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onOpenNudge(task.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-700" />
              <span>Nudge</span>
            </button>
            <button
              onClick={handleDeleteTask}
              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              title="Delete Deadline"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Task Details */}
      <div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
          <span>By: {task.createdBy.name}</span>
          <span>•</span>
          <span>Due: {formatDateTime(task.dueDateTime)}</span>
        </div>
      </div>

      {/* Compliance Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">
            Submissions: {submissionsCount} of {totalAssigned} Received
          </span>
          <span className="font-mono text-slate-800">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              completionPercentage === 100 ? 'bg-emerald-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Member Upload Area */}
      {isAssignedToMe && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900">
              Your Deliverable:
            </span>
            {mySubmission ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Submitted
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Pending Upload
              </span>
            )}
          </div>

          {mySubmission ? (
            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-slate-900 truncate">
                    {mySubmission.fileName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {mySubmission.fileSize} • Uploaded {formatDateTime(mySubmission.uploadedAt)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPreviewExcel(mySubmission, task.title)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span>View Sheet</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleFileUpload} className="space-y-2.5">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white group"
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
                <UploadCloud className="w-6 h-6 mx-auto text-slate-400 group-hover:text-emerald-600 transition-colors mb-1" />
                <div className="text-xs font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Select or drop required spreadsheet / file'}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add notes or comments (optional)..."
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg input-clean text-xs text-slate-900"
                />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Submit'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Expand Submissions Breakdown */}
      <div className="border-t border-slate-100 pt-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors py-1 cursor-pointer"
        >
          <span>
            Assignee Submission Status ({submissionsCount}/{totalAssigned})
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="mt-2 divide-y divide-slate-100 rounded-lg bg-slate-50 border border-slate-200 p-2">
            {assignedMemberIds.map((mId) => {
              const member = members.find((m) => m.id === mId);
              const sub = task.submissions[mId];

              return (
                <div
                  key={mId}
                  className="py-2 px-2.5 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span>{member?.avatar || '👤'}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 truncate block text-xs">
                        {member?.name || 'Engineer'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {member?.department || 'Department'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {sub ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-600 max-w-[140px] truncate hidden sm:inline-block">
                          {sub.fileName}
                        </span>
                        <button
                          onClick={() => onPreviewExcel(sub, task.title)}
                          className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-emerald-700" />
                          <span>View</span>
                        </button>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-semibold">
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
