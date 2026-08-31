'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Users,
  Plus,
  Key,
  Copy,
  Check,
  BellRing,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Crown,
  Shield,
  Activity,
  ArrowLeft,
  Building2,
  Share2,
  RefreshCw,
  Eye
} from 'lucide-react';
import { Room, Member, Task, Submission, Role, ClientUserSession } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { TaskCard } from '@/components/TaskCard';
import { MemberList } from '@/components/MemberList';
import { SubmissionsMatrix } from '@/components/SubmissionsMatrix';
import { UserSwitcher } from '@/components/UserSwitcher';
import { JoinModal } from '@/components/JoinModal';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { NudgeModal } from '@/components/NudgeModal';
import { ExportModal } from '@/components/ExportModal';
import { ExcelPreviewModal } from '@/components/ExcelPreviewModal';
import { NotificationDrawer } from '@/components/NotificationDrawer';
import { formatDateTime } from '@/lib/utils';

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const unwrappedParams = use(params);
  const roomCode = unwrappedParams.code.toUpperCase();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [currentUser, setCurrentUser] = useState<ClientUserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'TASKS' | 'MATRIX' | 'ROSTER' | 'ACTIVITY'>('TASKS');

  // Modal States
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [nudgeTaskId, setNudgeTaskId] = useState<string | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [previewSubmission, setPreviewSubmission] = useState<{
    submission: Submission;
    taskTitle: string;
  } | null>(null);

  // Fetch Room Data
  const fetchRoomData = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Room not found.');
      }
      setRoom(data.room);
      return data.room as Room;
    } catch (err: unknown) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [roomCode]);

  // Initial Load and Session Restore
  useEffect(() => {
    fetchRoomData().then((fetchedRoom) => {
      if (!fetchedRoom) return;

      // Check localStorage for an existing session in this room
      const savedSession = localStorage.getItem(`cowork_session_${roomCode}`);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          // Check if user still exists in room
          const memberInRoom = fetchedRoom.members.find((m) => m.id === parsed.memberId);
          if (memberInRoom) {
            setCurrentUser({
              memberId: memberInRoom.id,
              name: memberInRoom.name,
              role: memberInRoom.role,
              department: memberInRoom.department,
              roomCode,
              avatar: memberInRoom.avatar,
            });
            return;
          }
        } catch {
          // ignore parsing error
        }
      }

      // If no valid session, set current user to Host by default for instant test drive or open Join Modal
      const defaultHost = fetchedRoom.members.find((m) => m.role === 'HOST') || fetchedRoom.members[0];
      if (defaultHost) {
        const hostSession: ClientUserSession = {
          memberId: defaultHost.id,
          name: defaultHost.name,
          role: defaultHost.role,
          department: defaultHost.department,
          roomCode,
          avatar: defaultHost.avatar,
        };
        setCurrentUser(hostSession);
        localStorage.setItem(`cowork_session_${roomCode}`, JSON.stringify(hostSession));
      }
    });

    // Real-time polling every 4 seconds
    const interval = setInterval(() => {
      fetchRoomData();
    }, 4000);

    return () => clearInterval(interval);
  }, [roomCode, fetchRoomData]);

  // Handle Joining Room via Popup
  const handleJoinSuccess = async (memberData: {
    name: string;
    department?: string;
    empId?: string;
    avatar: string;
  }) => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to join room.');
      }

      const session: ClientUserSession = {
        memberId: data.member.id,
        name: data.member.name,
        role: data.member.role,
        department: data.member.department,
        roomCode,
        avatar: data.member.avatar,
      };

      setCurrentUser(session);
      localStorage.setItem(`cowork_session_${roomCode}`, JSON.stringify(session));
      setIsJoinModalOpen(false);
      setRoom(data.room);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Switch User identity for seamless demo testing
  const handleSwitchUser = (member: Member) => {
    const session: ClientUserSession = {
      memberId: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      roomCode,
      avatar: member.avatar,
    };
    setCurrentUser(session);
    localStorage.setItem(`cowork_session_${roomCode}`, JSON.stringify(session));
  };

  // Handle Role Change (Promote / Demote Co-Host)
  const handleRoleChange = async (targetMemberId: string, newRole: Role) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/rooms/${roomCode}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetMemberId,
          newRole,
          actorId: currentUser.memberId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRoom(data.room);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Copy Room Code / Share Link
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Unread notifications count
  const unreadCount = room && currentUser
    ? room.notifications.filter((n) => !n.readBy.includes(currentUser.memberId)).length
    : 0;

  const isHostOrCoHost = currentUser?.role === 'HOST' || currentUser?.role === 'CO_HOST';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold">Connecting to Room #{roomCode}...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl glass-panel border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Room Not Found</h2>
          <p className="text-xs text-slate-400">
            Room code <span className="font-mono text-rose-300">#{roomCode}</span> does not exist or has expired.
          </p>
          <div className="pt-2 flex gap-3">
            <Link
              href="/"
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Go to Home
            </Link>
            <Link
              href="/room/TATA-DIE"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Open Demo Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      {/* Top Navbar */}
      <Navbar
        roomCode={room.code}
        roomName={room.name}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Room Header Hero Card */}
        <div className="p-6 rounded-2xl glass-panel-glow border border-slate-700/80 relative overflow-hidden space-y-5">
          {/* Ambient light glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top row: Back to rooms & Quick Role Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">Viewing as:</span>
              <UserSwitcher
                members={room.members}
                currentMemberId={currentUser?.memberId || ''}
                onSwitchUser={handleSwitchUser}
                onOpenJoinAsNew={() => setIsJoinModalOpen(true)}
              />
            </div>
          </div>

          {/* Center: Title & Room Code Badge */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-semibold">
                  <Building2 className="w-3 h-3" />
                  {room.department}
                </span>
                {room.plantLocation && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    • {room.plantLocation}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {room.name}
              </h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Room Host: <strong className="text-slate-200">{room.hostName}</strong></span>
                <span>•</span>
                <span>Created {formatDateTime(room.createdAt)}</span>
              </p>
            </div>

            {/* Among Us Room Code Display */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-blue-500/40 shadow-lg shadow-blue-500/10">
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">Room Code</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-white tracking-widest">
                    {room.code}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  title="Copy room code"
                  className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 transition-colors ml-2 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleShareLink}
                title="Share Room Link"
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons Toolbar for Host & Co-Hosts */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              {isHostOrCoHost ? (
                <>
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Deadline</span>
                  </button>

                  <button
                    onClick={() => {
                      setNudgeTaskId(undefined);
                      setIsNudgeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Nudge Pending Members</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Member view: Upload your assigned sheets and files below.</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Master Grid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'TASKS', label: 'Deadlines & Deliverables', icon: Clock, count: room.tasks.length },
              { id: 'MATRIX', label: 'Live Submissions Matrix', icon: FileSpreadsheet, badge: 'Grid' },
              { id: 'ROSTER', label: 'Team Roster & Roles', icon: Users, count: room.members.length },
              { id: 'ACTIVITY', label: 'Activity & Audit Stream', icon: Activity, count: room.notifications.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
                      {tab.count}
                    </span>
                  )}
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchRoomData()}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh room state"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content 1: Deadlines & Tasks */}
        {activeTab === 'TASKS' && (
          <div className="space-y-4">
            {room.tasks.length === 0 ? (
              <div className="text-center py-16 rounded-2xl glass-panel border border-slate-800 space-y-3">
                <Clock className="w-12 h-12 mx-auto text-slate-600" />
                <h3 className="text-base font-bold text-white">No Deadlines Assigned Yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isHostOrCoHost
                    ? 'Click "Assign Deadline" above to set your first task, deliverable format, and due date.'
                    : 'The room host has not published any deadlines yet. Stay tuned!'}
                </p>
                {isHostOrCoHost && (
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    + Assign First Deadline
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {room.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    roomCode={room.code}
                    currentMemberId={currentUser?.memberId || ''}
                    currentMemberName={currentUser?.name || ''}
                    isHostOrCoHost={isHostOrCoHost}
                    members={room.members}
                    onTaskUpdated={fetchRoomData}
                    onPreviewExcel={(sub, title) =>
                      setPreviewSubmission({ submission: sub, taskTitle: title })
                    }
                    onOpenNudge={(taskId) => {
                      setNudgeTaskId(taskId);
                      setIsNudgeModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content 2: Submissions Matrix */}
        {activeTab === 'MATRIX' && (
          <SubmissionsMatrix
            room={room}
            onPreviewExcel={(sub, title) =>
              setPreviewSubmission({ submission: sub, taskTitle: title })
            }
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenNudge={() => {
              setNudgeTaskId(undefined);
              setIsNudgeModalOpen(true);
            }}
          />
        )}

        {/* Tab Content 3: Team Roster & Roles */}
        {activeTab === 'ROSTER' && (
          <MemberList
            members={room.members}
            currentMemberId={currentUser?.memberId || ''}
            isHostOrCoHost={isHostOrCoHost}
            onRoleChange={handleRoleChange}
          />
        )}

        {/* Tab Content 4: Activity Stream */}
        {activeTab === 'ACTIVITY' && (
          <div className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Real-Time Room Event Log</span>
            </h3>
            <div className="space-y-3 divide-y divide-slate-800/60">
              {room.notifications.map((notif) => (
                <div key={notif.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 border border-slate-700/80">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-200">{notif.title}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDateTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Popups and Modals */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        roomCode={room.code}
        defaultDepartment={room.department}
        onJoinSuccess={handleJoinSuccess}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        roomCode={room.code}
        actorId={currentUser?.memberId || ''}
        members={room.members}
        onTaskCreated={fetchRoomData}
      />

      <NudgeModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        roomCode={room.code}
        actorId={currentUser?.memberId || ''}
        actorName={currentUser?.name || ''}
        tasks={room.tasks}
        onNudgeSent={fetchRoomData}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        roomCode={room.code}
      />

      {previewSubmission && (
        <ExcelPreviewModal
          isOpen={true}
          onClose={() => setPreviewSubmission(null)}
          fileName={previewSubmission.submission.fileName}
          taskTitle={previewSubmission.taskTitle}
          memberName={previewSubmission.submission.memberName}
          uploadedAt={previewSubmission.submission.uploadedAt}
          previewData={previewSubmission.submission.previewData}
        />
      )}

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={room.notifications}
        currentMemberId={currentUser?.memberId}
        onMarkAllRead={() => {
          // Mark all read in memory
          if (currentUser) {
            room.notifications.forEach((n) => {
              if (!n.readBy.includes(currentUser.memberId)) {
                n.readBy.push(currentUser.memberId);
              }
            });
            setRoom({ ...room });
          }
        }}
      />
    </div>
  );
}
