'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Key,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  Sparkles,
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  Share2,
  Layers,
  Zap
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { JoinModal } from '@/components/JoinModal';
import { CreateRoomModal } from '@/components/CreateRoomModal';

export default function HomePage() {
  const router = useRouter();
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      router.push(`/room/${roomCodeInput.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Navbar */}
      <Navbar
        onOpenCreateRoom={() => setIsCreateModalOpen(true)}
        onOpenJoinModal={() => setIsJoinModalOpen(true)}
      />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Hero Banner */}
        <div className="relative text-center space-y-6 max-w-4xl mx-auto">
          {/* Subtle glowing orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Tata Motors Design Dept Origin Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-lg shadow-blue-500/10 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Built for Engineering &amp; Design Heads (Inspired by Tata Motors Workflow)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            Manage Deadlines &amp; Collect Multiple Excel Sheets{' '}
            <span className="gradient-text-blue block sm:inline">Without Group Chat Chaos.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Create an <strong className="text-white">Among Us-style room code</strong> for your team. Engineers join in 1 click with just their name—no Google login required. Assign deadlines, track die project specs &amp; Excel sheets, and send instant notification pings.
          </p>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto pt-4 text-left">
            {/* Card 1: Join with Code */}
            <div className="p-6 rounded-2xl glass-panel-glow border border-blue-500/30 space-y-4 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Key className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> No Sign-in
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Join Existing Room</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the 6-character room code shared by your department head or host.
                </p>
              </div>

              <form onSubmit={handleJoinByCode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TATA-DIE"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 rounded-xl glass-input text-blue-400 font-mono font-bold text-sm tracking-wider uppercase placeholder:normal-case placeholder:text-slate-500 placeholder:font-sans focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!roomCodeInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Card 2: Create New Room */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-700/80 space-y-4 relative overflow-hidden group hover:border-slate-600 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Host Powers 👑
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Host a Room / Group</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Generate a custom room code, delegate Co-Hosts, and manage engineering deliverables.
                </p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create New Room Code</span>
                <Plus className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Test Drive Flagship Tata Motors Demo Room */}
          <div className="pt-2">
            <Link
              href="/room/TATA-DIE"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/60 border border-blue-500/40 hover:border-blue-400 text-white text-xs font-semibold shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 transition-all group"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform" />
              <span>
                <strong>Test Drive Demo Room:</strong> &quot;Tata Motors — Die &amp; Tooling Design Dept&quot; (<span className="font-mono text-blue-300">#TATA-DIE</span>)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Real World Problem vs Co-work Solution */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why Traditional Messaging Fails for Engineering Teams
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              How Co-work replaces messy messaging groups with frictionless room-based deadline tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-rose-500/20 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
                ❌
              </div>
              <h3 className="text-sm font-bold text-white">The Old Problem</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Department heads must message 20+ engineers individually or scroll through 100s of WhatsApp/Teams chat messages to find who sent which Excel sheet or CAD die file.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-blue-500/30 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                ⚡
              </div>
              <h3 className="text-sm font-bold text-white">Among Us Room Codes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Host creates a 6-character room code (e.g. <span className="font-mono text-blue-300">TATA-DIE</span>). Engineers join instantly by entering their name in a popup without login friction.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                📊
              </div>
              <h3 className="text-sm font-bold text-white">Automated Compliance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live countdown timers, instant submission alerts, 1-click &quot;Nudge&quot; pings for pending members, and unified Excel master matrix export.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Engineered for Speed &amp; Precision
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h4 className="text-xs font-bold text-white">No Login Required</h4>
              <p className="text-[11px] text-slate-400">
                Popup asks for name &amp; department. Instant access without storing sensitive passwords.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h4 className="text-xs font-bold text-white">Co-Host Delegation</h4>
              <p className="text-[11px] text-slate-400">
                Host can promote trusted lead engineers to Co-Hosts with deadline creation and nudge privileges.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">Inline Excel Inspection</h4>
              <p className="text-[11px] text-slate-400">
                Inspect tolerance data, punch clearance, and deviation metrics without opening Excel locally.
              </p>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
              <BellRing className="w-5 h-5 text-amber-400" />
              <h4 className="text-xs font-bold text-white">Smart Nudge &amp; Alerts</h4>
              <p className="text-[11px] text-slate-400">
                Audible chimes and priority pings to notify engineers when a deadline is approaching.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Co-work</span>
            <span>•</span>
            <span>Room-Based Deadline &amp; File Hub</span>
          </div>
          <div>
            Vercel-Deployable Fullstack Architecture • Built for Hackathon Speedrun
          </div>
        </div>
      </footer>

      {/* Modals */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinSuccess={(data) => {
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
