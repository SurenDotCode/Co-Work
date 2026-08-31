'use client';

import React, { useState } from 'react';
import { Key, User, ArrowRight, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-white border border-slate-200 p-6 shadow-xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Join Room {roomCode ? <span className="text-emerald-700 font-mono">#{roomCode}</span> : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your name to appear in the member list and access deadlines. No login or password required.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!roomCode && (
            <div>
              <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-slate-500" />
                Room Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TATA-DIE or CW-4921"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg input-clean text-slate-900 font-mono uppercase"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-slate-500" />
              Your Full Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Arun Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-clean text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Department / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Tooling Design"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg input-clean text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Employee ID (Opt)
              </label>
              <input
                type="text"
                placeholder="e.g. TM-1049"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg input-clean text-slate-900"
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Avatar Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                    selectedAvatar === av
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <span>Enter Room Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
