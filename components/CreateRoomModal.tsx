'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, User, Key, RefreshCw, ArrowRight, X } from 'lucide-react';
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

      if (typeof window !== 'undefined') {
        const session = {
          memberId: data.hostMember.id,
          name: data.hostMember.name,
          role: 'HOST',
          department: data.hostMember.department,
          roomCode: data.room.code,
          avatar: '👑',
        };
        localStorage.setItem(`cowork_session_${data.room.code}`, JSON.stringify(session));

        // Save in WhatsApp-style saved groups
        try {
          const stored = localStorage.getItem('cowork_saved_groups');
          let groups = stored ? JSON.parse(stored) : [];
          groups = groups.filter((g: { code: string }) => g.code !== data.room.code);
          groups.unshift({
            code: data.room.code,
            name: data.room.name,
            department: data.room.department,
            hostName: data.hostMember.name,
            myRole: 'HOST',
            myName: data.hostMember.name,
            myMemberId: data.hostMember.id,
            lastVisited: new Date().toISOString(),
          });
          localStorage.setItem('cowork_saved_groups', JSON.stringify(groups));
        } catch {
          // ignore
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-[#111114] border border-[#27272a] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Create a New Room
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Generate an Among Us-style room code to share with your engineers.
          </p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Room / Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Tata Motors — Heavy Die & Stamping Tooling"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-minimal text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Host Name (Your Name) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. B. Yerra"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg input-minimal text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Department / Division
              </label>
              <input
                type="text"
                placeholder="e.g. Vehicle Engineering"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg input-minimal text-white"
              />
            </div>
          </div>

          {/* Room Code */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-300 flex items-center gap-1">
                <Key className="w-3 h-3 text-neutral-400" />
                Room Code *
              </label>
              <button
                type="button"
                onClick={handleRandomizeCode}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Randomize
              </button>
            </div>
            <input
              type="text"
              required
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-lg input-minimal text-blue-400 font-mono font-bold uppercase"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !hostName.trim()}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Creating...</span>
            ) : (
              <>
                <span>Create &amp; Enter Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
