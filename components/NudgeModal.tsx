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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-[#111114] border border-[#27272a] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400" />
            Nudge Pending Members
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Send an instant notification ping to engineers who haven&apos;t submitted their files.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSendNudge} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Select Deadline Target
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-minimal text-white bg-[#0c0c0e]"
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
            <label className="block font-semibold text-neutral-300 mb-1">
              Custom Reminder Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder={`e.g. "Reminder from ${actorName}: Press trial starts soon. Please upload your sheets."`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-minimal text-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
