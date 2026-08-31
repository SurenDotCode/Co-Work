'use client';

import React, { useState } from 'react';
import { Key, User, Briefcase, ArrowRight, ShieldCheck, X, Sparkles } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose?: () => void;
  roomCode?: string;
  defaultDepartment?: string;
  onJoinSuccess: (memberData: { name: string; department?: string; empId?: string; avatar: string }) => void;
  isLoading?: boolean;
}

const AVATARS = ['⚡', '⚙️', '📐', '🔬', '🔧', '🚀', '💡', '📊', '🛡️', '👨‍💻', '👩‍💻'];

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  roomCode = '',
  defaultDepartment = '',
  onJoinSuccess,
  isLoading = false,
}) => {
  const [code, setCode] = useState(roomCode);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(defaultDepartment);
  const [empId, setEmpId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    setError('');
    onJoinSuccess({
      name: name.trim(),
      department: department.trim() || undefined,
      empId: empId.trim() || undefined,
      avatar: selectedAvatar,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-glow border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Background ambient light */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            No Sign-in Required
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Join Room {roomCode ? <span className="text-blue-400 font-mono">#{roomCode}</span> : ''}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter your name to access deadlines and submit files. Zero password or Google sign-in hassle.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!roomCode && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-blue-400" />
                Room Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TATA-DIE or CW-4921"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white font-mono text-sm uppercase placeholder:normal-case placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Your Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Arun Sharma / Neha Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                Department / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Tooling Design Eng"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Emp / Badge ID (Opt)
              </label>
              <input
                type="text"
                placeholder="e.g. TM-1049"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Choose Avatar Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                    selectedAvatar === av
                      ? 'bg-blue-600 ring-2 ring-blue-400 shadow-lg scale-110'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Connecting to Room...</span>
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
