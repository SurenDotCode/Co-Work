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
  ArrowLeft,
  Building2,
  Share2,
  RefreshCw,
  User,
  Crown,
  Activity
} from 'lucide-react';
import { Room, Member, Task, Submission, Role, ClientUserSession, SavedGroup } from '@/lib/types';
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
  const [activeTab, setActiveTab] = useState<'TASKS' | 'ROSTER' | 'MATRIX' | 'ACTIVITY'>('TASKS');

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

  // Helper to persist room into WhatsApp-style saved groups
  const persistSavedGroup = useCallback((targetRoom: Room, session: ClientUserSession) => {
    try {
      const stored = localStorage.getItem('cowork_saved_groups');
      let groups: SavedGroup[] = stored ? JSON.parse(stored) : [];
      groups = groups.filter((g) => g.code !== targetRoom.code);

      const newEntry: SavedGroup = {
        code: targetRoom.code,
        name: targetRoom.name,
        department: targetRoom.department,
        hostName: targetRoom.hostName,
        myRole: session.role,
        myName: session.name,
        myMemberId: session.memberId,
        lastVisited: new Date().toISOString(),
      };

      groups.unshift(newEntry);
      localStorage.setItem('cowork_saved_groups', JSON.stringify(groups));
    } catch (err) {
      console.error(err);
    }
  }, []);

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

      const savedSession = localStorage.getItem(`cowork_session_${roomCode}`);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          const memberInRoom = fetchedRoom.members.find((m) => m.id === parsed.memberId);
          if (memberInRoom) {
            const session: ClientUserSession = {
              memberId: memberInRoom.id,
              name: memberInRoom.name,
              role: memberInRoom.role,
              department: memberInRoom.department,
              roomCode,
              avatar: memberInRoom.avatar,
            };
            setCurrentUser(session);
            persistSavedGroup(fetchedRoom, session);
            return;
          }
        } catch {
          // ignore
        }
      }

      // Default to Host session for demo or open popup
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
        persistSavedGroup(fetchedRoom, hostSession);
      }
    });

    const interval = setInterval(() => {
      fetchRoomData();
    }, 4000);

    return () => clearInterval(interval);
  }, [roomCode, fetchRoomData, persistSavedGroup]);

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
      persistSavedGroup(data.room, session);
      setIsJoinModalOpen(false);
      setRoom(data.room);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // Switch User identity for seamless demo testing
  const handleSwitchUser = (member: Member) => {
    if (!room) return;
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
    persistSavedGroup(room, session);
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

  const unreadCount = room && currentUser
    ? room.notifications.filter((n) => !n.readBy.includes(currentUser.memberId)).length
    : 0;

  // STRICT PERMISSION: Only Host or Co-Host can assign deadlines or send nudges
  const isHostOrCoHost = currentUser?.role === 'HOST' || currentUser?.role === 'CO_HOST';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-neutral-400 text-xs">
        Connecting to #{roomCode}...
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-xl panel text-center space-y-3">
          <h2 className="text-base font-bold text-white">Room Not Found</h2>
          <p className="text-xs text-neutral-400">
            Room code <span className="font-mono text-white">#{roomCode}</span> does not exist.
          </p>
          <div className="pt-2 flex gap-2">
            <Link
              href="/"
              className="flex-1 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium text-center"
            >
              Go to Home
            </Link>
            <Link
              href="/room/TATA-DIE"
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium text-center"
            >
              Open Demo Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-neutral-100">
      <Navbar
        roomCode={room.code}
        roomName={room.name}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Header Card */}
        <div className="p-5 rounded-xl panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Groups</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Identity:</span>
              <UserSwitcher
                members={room.members}
                currentMemberId={currentUser?.memberId || ''}
                onSwitchUser={handleSwitchUser}
                onOpenJoinAsNew={() => setIsJoinModalOpen(true)}
              />
            </div>
          </div>

          {/* Title and Room Code */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>{room.department}</span>
                {room.plantLocation && <span>• {room.plantLocation}</span>}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {room.name}
              </h1>
              <div className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                <span>Host: <strong className="text-white">{room.hostName}</strong></span>
                <span>•</span>
                <span>Created {formatDateTime(room.createdAt)}</span>
              </div>
            </div>

            {/* Room Code Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#18181c] border border-[#27272a]">
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold">Room Code</div>
                  <div className="text-base font-mono font-bold text-white">
                    {room.code}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors ml-1 cursor-pointer"
                  title="Copy room code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={handleShareLink}
                className="p-2.5 rounded-lg bg-[#18181c] border border-[#27272a] hover:bg-[#222228] text-neutral-300 transition-colors cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Toolbar for Host & Co-Hosts */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#202024]">
            <div className="flex flex-wrap items-center gap-2">
              {isHostOrCoHost ? (
                <>
                  <button
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Deadline</span>
                  </button>

                  <button
                    onClick={() => {
                      setNudgeTaskId(undefined);
                      setIsNudgeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1814] hover:bg-[#26221c] text-amber-300 border border-amber-900/60 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Nudge Pending Members</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Member View: Submit your assigned spreadsheets and documents below.</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181c] hover:bg-[#222228] border border-[#27272a] text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export Matrix</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#222226]">
          <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'TASKS', label: 'Deadlines & Tasks', icon: Clock, count: room.tasks.length },
              { id: 'ROSTER', label: 'Room Members', icon: Users, count: room.members.length },
              { id: 'MATRIX', label: 'Submissions Matrix', icon: FileSpreadsheet },
              { id: 'ACTIVITY', label: 'Activity Log', icon: Activity, count: room.notifications.length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchRoomData()}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab 1: Tasks */}
        {activeTab === 'TASKS' && (
          <div className="space-y-3">
            {room.tasks.length === 0 ? (
              <div className="text-center py-12 rounded-xl panel text-neutral-400 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-neutral-600" />
                <h3 className="text-sm font-semibold text-white">No Deadlines Assigned</h3>
                <p className="text-neutral-500 max-w-xs mx-auto">
                  {isHostOrCoHost
                    ? 'Click "Assign Deadline" above to set a deadline for an individual engineer or the entire group.'
                    : 'The host has not published any deadlines yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
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

        {/* Tab 2: Roster */}
        {activeTab === 'ROSTER' && (
          <MemberList
            members={room.members}
            currentMemberId={currentUser?.memberId || ''}
            isHostOrCoHost={isHostOrCoHost}
            onRoleChange={handleRoleChange}
          />
        )}

        {/* Tab 3: Matrix */}
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

        {/* Tab 4: Activity */}
        {activeTab === 'ACTIVITY' && (
          <div className="rounded-xl panel p-5 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Room Activity Log
            </h3>
            <div className="space-y-2.5 divide-y divide-[#1e1e24] text-xs">
              {room.notifications.map((notif) => (
                <div key={notif.id} className="pt-2.5 first:pt-0">
                  <div className="flex items-center justify-between text-neutral-300 font-medium">
                    <span>{notif.title}</span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-neutral-400 mt-0.5">{notif.message}</p>
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
