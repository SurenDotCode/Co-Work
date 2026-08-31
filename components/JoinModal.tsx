'use client';

import React, { useState } from 'react';
import { Key, User, Briefcase, ArrowRight, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-[#111114] border border-[#27272a] p-6 shadow-2xl">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Join Room {roomCode ? <span className="text-blue-400 font-mono">#{roomCode}</span> : ''}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Enter your name to appear in the member list and access deadlines. No login or password required.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!roomCode && (
            <div>
              <label className="block font-semibold text-neutral-300 mb-1 flex items-center gap-1">
                <Key className="w-3 h-3 text-neutral-400" />
                Room Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TATA-DIE or CW-4921"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-lg input-minimal text-white font-mono uppercase"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-neutral-300 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-neutral-400" />
              Your Full Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Arun Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-minimal text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Department / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Tooling Design"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg input-minimal text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Employee ID (Opt)
              </label>
              <input
                type="text"
                placeholder="e.g. TM-1049"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg input-minimal text-white"
              />
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1.5">
              Avatar
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                    selectedAvatar === av
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#18181c] hover:bg-neutral-800 text-neutral-300 border border-[#27272a]'
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
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
