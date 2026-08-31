'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Plus, Key, Bell, Volume2, VolumeX, Sparkles, Building2 } from 'lucide-react';
import { NotificationItem } from '@/lib/types';
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Context */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Co-work <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">LIVE</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                Room-Based Deadline & Excel Hub
              </span>
            </div>
          </Link>

          {roomCode && (
            <div className="hidden md:flex items-center gap-2 pl-4 ml-3 border-l border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                {roomName || 'Active Room'}:
              </span>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-xs font-semibold tracking-wider flex items-center gap-1">
                <Key className="w-3 h-3 text-blue-400" />
                {roomCode}
              </span>
            </div>
          )}
        </div>

        {/* Center: Quick Code Entry (When not on a specific room or on landing) */}
        {!roomCode && (
          <form onSubmit={handleQuickJoin} className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Enter Room Code (e.g. TATA-DIE)..."
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value)}
              className="w-full px-3.5 py-1.5 pl-9 text-xs uppercase font-mono rounded-lg glass-input text-slate-200 placeholder:text-slate-500 placeholder:normal-case focus:border-blue-500"
            />
            <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              disabled={!quickCode.trim()}
              className="absolute right-1.5 px-2 py-0.5 text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-30"
            >
              Join
            </button>
          </form>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Audio alerts enabled' : 'Audio alerts muted'}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Notifications Trigger */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-rose-500/50 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          {/* Test Tata Motors Demo Button (if on home) */}
          {!roomCode && (
            <Link
              href="/room/TATA-DIE"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Test Tata Demo Room
            </Link>
          )}

          {/* Action Buttons */}
          {onOpenCreateRoom && (
            <button
              onClick={onOpenCreateRoom}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Room</span>
            </button>
          )}

          {onOpenJoinModal && (
            <button
              onClick={onOpenJoinModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span>Join with Code</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
