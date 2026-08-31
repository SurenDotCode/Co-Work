'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Key,
  Clock,
  ArrowRight,
  Building2,
  Crown,
  User,
  Trash2,
  Layers,
  Sparkles
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { JoinModal } from '@/components/JoinModal';
import { CreateRoomModal } from '@/components/CreateRoomModal';
import { SavedGroup } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);

  // Load persistent groups from localStorage (like WhatsApp group list)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cowork_saved_groups');
        let groups: SavedGroup[] = stored ? JSON.parse(stored) : [];

        // Ensure default flagship demo room is available in list
        const hasTata = groups.some((g) => g.code === 'TATA-DIE');
        if (!hasTata) {
          const defaultTata: SavedGroup = {
            code: 'TATA-DIE',
            name: 'Tata Motors — Die & Tooling Design Dept',
            department: 'Vehicle Engineering (Pune Plant)',
            hostName: 'B. Yerra (Head of Design)',
            myRole: 'HOST',
            myName: 'B. Yerra (Head of Design)',
            myMemberId: 'mem_host_father',
            lastVisited: new Date().toISOString(),
          };
          groups = [defaultTata, ...groups];
          localStorage.setItem('cowork_saved_groups', JSON.stringify(groups));
        }

        setSavedGroups(groups);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      router.push(`/room/${roomCodeInput.trim().toUpperCase()}`);
    }
  };

  const removeSavedGroup = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedGroups.filter((g) => g.code !== code);
    setSavedGroups(updated);
    localStorage.setItem('cowork_saved_groups', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-neutral-100">
      <Navbar
        onOpenCreateRoom={() => setIsCreateModalOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Header & Mission */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Tata Motors Engineering &amp; Design Dept Workflow</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
            Room-Based Deadlines &amp; Deliverables
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Create an Among Us-style room code for your department. Engineers join with their name in 1 click (no login required). Host assigns deadlines individually or across the group, inspects Excel sheets, and tracks submissions without group chat chaos.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Join with Code */}
          <div className="p-5 rounded-xl panel space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Join Room with Code</h3>
              </div>
              <span className="text-[11px] text-neutral-500">No Login Required</span>
            </div>
            <p className="text-xs text-neutral-400">
              Enter the room code shared by your department head or host.
            </p>

            <form onSubmit={handleJoinByCode} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="e.g. TATA-DIE or CW-4921"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 rounded-lg input-minimal text-xs font-mono font-bold tracking-wider uppercase text-white"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Card 2: Create Group */}
          <div className="p-5 rounded-xl panel space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-neutral-300" />
                <h3 className="text-sm font-semibold text-white">Host a New Room</h3>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">Host Controls 👑</span>
            </div>
            <p className="text-xs text-neutral-400">
              Generate a unique room code, assign deadlines to individual engineers, and track submissions.
            </p>

            <div className="pt-1">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full py-2 px-4 rounded-lg bg-[#18181c] hover:bg-[#222228] border border-[#2c2c34] text-neutral-200 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Group &amp; Generate Code</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp-Style Persistent Groups / Joined Rooms */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-neutral-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">
                Your Saved Groups &amp; Rooms
              </h2>
              <span className="px-2 py-0.2 rounded text-[11px] font-mono bg-neutral-800 text-neutral-300">
                {savedGroups.length}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500">
              Persists in your workspace like WhatsApp groups
            </span>
          </div>

          {savedGroups.length === 0 ? (
            <div className="text-center py-10 rounded-xl panel text-neutral-500 text-xs">
              No saved groups yet. Join a room with a code or create a new group above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedGroups.map((group) => (
                <div
                  key={group.code}
                  onClick={() => router.push(`/room/${group.code}`)}
                  className="p-4 rounded-xl panel-hover cursor-pointer space-y-3 group relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-400 px-1.5 py-0.5 rounded bg-blue-950/40 border border-blue-900/60">
                          #{group.code}
                        </span>
                        {group.myRole === 'HOST' ? (
                          <span className="text-[10px] font-medium text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> Host
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> Member
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white truncate mt-1.5 group-hover:text-blue-300 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {group.department}
                      </p>
                    </div>

                    <button
                      onClick={(e) => removeSavedGroup(group.code, e)}
                      title="Remove from saved groups"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-[#1e1e24]">
                    <span>Host: {group.hostName}</span>
                    <span className="flex items-center gap-1 text-blue-400 group-hover:translate-x-0.5 transition-transform font-medium">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222226] bg-[#09090b] py-5 mt-10 text-center text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Co-work • Room-Based Deadline &amp; File Platform</div>
          <div>Vercel Ready • 0-Config Serverless</div>
        </div>
      </footer>

      {/* Modals */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={() => {
          setIsJoinModalOpen(false);
          router.push(`/room/TATA-DIE`);
        }}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
