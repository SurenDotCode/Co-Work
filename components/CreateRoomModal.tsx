'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Key, RefreshCw, ArrowRight, X, Sparkles } from 'lucide-react';
import { generateRoomCode } from '@/lib/utils';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Die & Tooling Design Dept');
  const [hostName, setHostName] = useState('');
  const [customCode, setCustomCode] = useState(generateRoomCode('TATA'));
  const [plantLocation, setPlantLocation] = useState('Pune Vehicle Plant');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRandomizeCode = () => {
    setCustomCode(generateRoomCode('CW'));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hostName.trim()) {
      setError('Please provide a Room Name and Host Name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          department: department.trim(),
          hostName: hostName.trim(),
          customCode: customCode.trim(),
          plantLocation: plantLocation.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create room.');
      }

      // Store current user session in localStorage for this room
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `cowork_session_${data.room.code}`,
          JSON.stringify({
            memberId: data.hostMember.id,
            name: data.hostMember.name,
            role: 'HOST',
            department: data.hostMember.department,
            roomCode: data.room.code,
            avatar: '👑',
          })
        );
      }

      onClose();
      router.push(`/room/${data.room.code}`);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Host Leadership Workspace
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Create a New Collaboration Room
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate an Among Us-style room code to share with your engineers and team members.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Room / Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tata Motors — Heavy Die & Stamping Tooling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Host Name (Your Name) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B. Yerra (Head of Design)"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Department / Division
              </label>
              <input
                type="text"
                placeholder="e.g. Vehicle Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Room Code Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                Room Code (Shareable Among Us Code) *
              </label>
              <button
                type="button"
                onClick={handleRandomizeCode}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Randomize
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-blue-400 font-mono font-bold text-sm tracking-wider uppercase focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Plant / Location (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Pune Plant - Pimpri Works"
              value={plantLocation}
              onChange={(e) => setPlantLocation(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !hostName.trim()}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Initializing Room...</span>
            ) : (
              <>
                <span>Launch Room & Get Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
