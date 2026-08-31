'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Key,
  ArrowRight,
  Crown,
  User,
  Trash2,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { JoinModal } from '@/components/JoinModal';
import { CreateRoomModal } from '@/components/CreateRoomModal';
import { SavedGroup } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cowork_saved_groups');
        let groups: SavedGroup[] = stored ? JSON.parse(stored) : [];

        // Ensure default flagship demo room is always in the saved list
        const hasTata = groups.some((g) => g.code === 'TATA-DIE');
        if (!hasTata) {
          const defaultTata: SavedGroup = {
            code: 'TATA-DIE',
            name: 'Die & Tooling Design Dept',
            department: 'Vehicle Engineering',
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <Navbar
        onOpenCreateRoom={() => setIsCreateModalOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Room Deadlines &amp; File Submissions
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            Assign deadlines to individual engineers or team groups, collect Excel sheets and project deliverables, and track real-time submission status.
          </p>
        </div>

        {/* Action Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Join Panel */}
          <div className="p-6 rounded-xl card-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Join a Room</h3>
                <p className="text-xs text-slate-500">Enter with a 6-character room code</p>
              </div>
            </div>

            <form onSubmit={handleJoinByCode} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="e.g. TATA-DIE or CW-4921"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="flex-1 px-3.5 py-2 rounded-lg input-clean text-xs font-mono font-bold uppercase text-slate-900"
              />
              <button
                type="submit"
                disabled={!roomCodeInput.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Create Panel */}
          <div className="p-6 rounded-xl card-white space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Create a New Room</h3>
                <p className="text-xs text-slate-500">Host a room and assign deadlines</p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Room Code</span>
            </button>
          </div>
        </div>

        {/* Your Saved Groups (Persistent List) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Your Rooms &amp; Groups
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {savedGroups.length}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Rooms you have created or joined remain saved here
            </span>
          </div>

          {savedGroups.length === 0 ? (
            <div className="text-center py-10 rounded-xl card-white text-slate-500 text-xs">
              No saved rooms yet. Join with a code or create a room above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedGroups.map((group) => (
                <div
                  key={group.code}
                  onClick={() => router.push(`/room/${group.code}`)}
                  className="p-5 rounded-xl card-white hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 group relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          #{group.code}
                        </span>
                        {group.myRole === 'HOST' ? (
                          <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" /> Host
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" /> Member
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate mt-2 group-hover:text-emerald-700 transition-colors">
                        {group.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {group.department}
                      </p>
                    </div>

                    <button
                      onClick={(e) => removeSavedGroup(group.code, e)}
                      title="Remove from saved list"
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <span>Host: {group.hostName}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Open <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-10 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-semibold text-slate-700">Co-work • Room Deadline &amp; File Platform</div>
          <div>Vercel Ready Fullstack App</div>
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
