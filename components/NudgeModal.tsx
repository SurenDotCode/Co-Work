'use client';

import React, { useState } from 'react';
import { BellRing, Send, X, Users } from 'lucide-react';
import { Task } from '@/lib/types';
import { playNotificationSound } from '@/lib/utils';

interface NudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  actorId: string;
  actorName: string;
  tasks: Task[];
  onNudgeSent: () => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  actorId,
  actorName,
  tasks,
  onNudgeSent,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('ALL');
  const [customMessage, setCustomMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendNudge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/rooms/${roomCode}/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId,
          taskId: selectedTaskId === 'ALL' ? undefined : selectedTaskId,
          customMessage: customMessage.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reminder.');
      }

      playNotificationSound();
      setSuccessMsg(`Reminder sent to ${data.countNudged} members.`);
      onNudgeSent();

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1000);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-600" />
            Nudge Pending Members
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Send an instant notification ping to engineers who haven&apos;t submitted their files.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSendNudge} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Select Deadline Target
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-clean text-slate-900 bg-white"
            >
              <option value="ALL">All Active Deadlines</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Custom Reminder Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder={`e.g. "Reminder from ${actorName}: Please submit your spreadsheets soon."`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-clean text-slate-900 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Sending...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send Reminder Ping</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
