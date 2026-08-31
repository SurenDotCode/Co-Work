'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Plus, Key, Bell, Volume2, VolumeX, Building2, Copy, Check } from 'lucide-react';
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
    <header className="sticky top-0 z-40 w-full border-b border-[#222226] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              Co-work
            </span>
          </Link>

          {roomCode && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#27272a] text-xs">
              <span className="text-neutral-400 truncate max-w-[160px]">
                {roomName || 'Workspace'}
              </span>
              <button
                onClick={copyCode}
                className="px-2 py-0.5 rounded bg-[#18181c] border border-[#2c2c34] text-neutral-300 font-mono text-[11px] font-medium flex items-center gap-1 hover:border-neutral-500 transition-colors"
                title="Click to copy code"
              >
                <span>#{roomCode}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-500" />}
              </button>
            </div>
          )}
        </div>

        {/* Center: Quick Code Entry on Landing Page */}
        {!roomCode && (
          <form onSubmit={handleQuickJoin} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Enter Room Code (e.g. TATA-DIE)..."
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 text-xs font-mono uppercase rounded-md input-minimal text-neutral-200 placeholder:normal-case placeholder:text-neutral-500"
            />
            <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 pointer-events-none" />
            <button
              type="submit"
              disabled={!quickCode.trim()}
              className="absolute right-1 px-2 py-0.5 text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors disabled:opacity-30"
            >
              Go
            </button>
          </form>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Audio enabled' : 'Audio muted'}
            className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-neutral-300" /> : <VolumeX className="w-4 h-4 text-neutral-600" />}
          </button>

          {/* Notifications */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {onOpenCreateRoom && (
            <button
              onClick={onOpenCreateRoom}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Group</span>
            </button>
          )}

          {onOpenJoinModal && (
            <button
              onClick={onOpenJoinModal}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-neutral-400" />
              <span>Join with Code</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
