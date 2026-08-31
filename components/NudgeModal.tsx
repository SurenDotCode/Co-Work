'use client';

import React, { useState } from 'react';
import { BellRing, Send, X, AlertTriangle, Users } from 'lucide-react';
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
      setSuccessMsg(`⚡ High-priority ping delivered to ${data.countNudged} members.`);
      onNudgeSent();

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1200);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-glow border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
            <BellRing className="w-3.5 h-3.5" />
            Host / Co-Host Broadcast
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Nudge Pending Members
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Send an instant audible chime and notification badge to everyone who has not uploaded their required spreadsheet or file.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSendNudge} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Deadline to Nudge For
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-xs focus:border-blue-500 bg-slate-900"
            >
              <option value="ALL">All Active Deadlines & Tasks</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.priority} priority)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Reminder Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder={`e.g. "Urgent: Press trial starts in 30 mins at Pune shop floor. Please upload die clearances now!" - ${actorName}`}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              This will trigger high-priority notification pings in the room notification tray and audio alerts for all non-submitting engineers.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-semibold text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Broadcasting Nudge...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Instant Nudge / Ping</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
