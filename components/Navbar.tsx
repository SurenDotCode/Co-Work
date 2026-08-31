'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Plus, Key, Bell, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { playNotificationSound } from '@/lib/utils';

interface NavbarProps {
  roomCode?: string;
  roomName?: string;
  unreadCount?: number;
  onOpenNotifications?: () => void;
  onOpenCreateRoom?: () => void;
  onOpenJoinModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  roomName,
  unreadCount = 0,
  onOpenNotifications,
  onOpenCreateRoom,
  onOpenJoinModal,
}) => {
  const router = useRouter();
  const [quickCode, setQuickCode] = React.useState('');
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const handleQuickJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim()) {
      router.push(`/room/${quickCode.trim().toUpperCase()}`);
    }
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      playNotificationSound();
    }
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-4">
        {/* Left: Brand & Room Info */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              Co-work
            </span>
          </Link>

          {roomCode && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs">
              <span className="text-slate-600 font-medium truncate max-w-[180px]">
                {roomName || 'Workspace'}
              </span>
              <button
                onClick={copyCode}
                className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-semibold flex items-center gap-1 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Copy room code"
              >
                <span>#{roomCode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Center: Quick Code Entry on Landing Page */}
        {!roomCode && (
          <form onSubmit={handleQuickJoin} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Enter Room Code..."
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 text-xs font-mono uppercase rounded-lg input-clean text-slate-900 placeholder:normal-case placeholder:text-slate-400 font-medium"
            />
            <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <button
              type="submit"
              disabled={!quickCode.trim()}
              className="absolute right-1 px-2.5 py-0.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors disabled:opacity-40 cursor-pointer"
            >
              Join
            </button>
          </form>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Audio alerts active' : 'Audio muted'}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Notifications */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-600 text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {onOpenCreateRoom && (
            <button
              onClick={onOpenCreateRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Room</span>
            </button>
          )}

          {onOpenJoinModal && (
            <button
              onClick={onOpenJoinModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>Join with Code</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
