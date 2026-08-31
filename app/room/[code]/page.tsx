'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Users,
  Plus,
  Copy,
  Check,
  BellRing,
  FileSpreadsheet,
  ArrowLeft,
  Share2,
  RefreshCw,
  User,
  Shield,
  Crown,
  Activity,
  CheckCircle2,
  AlertCircle
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

  // Main Active Tab
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TASKS' | 'MEMBERS' | 'MATRIX'>('DASHBOARD');

  // Modals
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [preselectedMemberId, setPreselectedMemberId] = useState<string | undefined>(undefined);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [nudgeTaskId, setNudgeTaskId] = useState<string | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [previewSubmission, setPreviewSubmission] = useState<{
    submission: Submission;
    taskTitle: string;
  } | null>(null);

  // Sync to Saved Groups
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

      // Default to host session for demo
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

  // Join Room
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

  // Switch User
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

  // Role Change
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

  const openAssignModalForMember = (memberId?: string) => {
    setPreselectedMemberId(memberId);
    setIsCreateTaskModalOpen(true);
  };

  const unreadCount = room && currentUser
    ? room.notifications.filter((n) => !n.readBy.includes(currentUser.memberId)).length
    : 0;

  // STRICT PERMISSION: Only Host or Co-Host can assign deadlines or send nudges
  const isHostOrCoHost = currentUser?.role === 'HOST' || currentUser?.role === 'CO_HOST';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-sm">
        Loading room #{roomCode}...
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-xl card-white text-center space-y-3">
          <h2 className="text-base font-bold text-slate-900">Room Not Found</h2>
          <p className="text-xs text-slate-500">
            Room code <span className="font-mono font-bold text-slate-800">#{roomCode}</span> does not exist.
          </p>
          <div className="pt-2 flex gap-2">
            <Link
              href="/"
              className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center"
            >
              Go to Home
            </Link>
            <Link
              href="/room/TATA-DIE"
              className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold text-center"
            >
              Open Demo Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <Navbar
        roomCode={room.code}
        roomName={room.name}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Room Header Banner */}
        <div className="p-6 rounded-xl card-white space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Rooms</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs">Active Identity:</span>
              <UserSwitcher
                members={room.members}
                currentMemberId={currentUser?.memberId || ''}
                onSwitchUser={handleSwitchUser}
                onOpenJoinAsNew={() => setIsJoinModalOpen(true)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-xs font-semibold text-emerald-700 mb-1">
                {room.department} {room.plantLocation ? `• ${room.plantLocation}` : ''}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {room.name}
              </h1>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>Room Host: <strong className="text-slate-800">{room.hostName}</strong></span>
                <span>•</span>
                <span>Created {formatDateTime(room.createdAt)}</span>
              </div>
            </div>

            {/* Room Code Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Room Code</div>
                  <div className="text-lg font-mono font-bold text-emerald-950">
                    {room.code}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors ml-1 cursor-pointer"
                  title="Copy room code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-emerald-700" />}
                </button>
              </div>

              <button
                onClick={handleShareLink}
                className="p-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {isHostOrCoHost ? (
                <>
                  <button
                    onClick={() => openAssignModalForMember(undefined)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Deadline</span>
                  </button>

                  <button
                    onClick={() => {
                      setNudgeTaskId(undefined);
                      setIsNudgeModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-700" />
                    <span>Nudge Pending Members</span>
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Member View: Submit your assigned spreadsheets and documents below.</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Matrix CSV</span>
            </button>
          </div>
        </div>

        {/* Dashboard 2-Column Layout: Left = Deadlines, Right = Active Members with direct Assign Button */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3 width): Deadlines & Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Active Deadlines &amp; Tasks
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {room.tasks.length}
                </span>
              </div>

              {isHostOrCoHost && (
                <button
                  onClick={() => openAssignModalForMember(undefined)}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Deadline</span>
                </button>
              )}
            </div>

            {room.tasks.length === 0 ? (
              <div className="text-center py-12 rounded-xl card-white text-slate-500 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-800">No Deadlines Assigned Yet</h3>
                <p className="max-w-xs mx-auto text-slate-500">
                  {isHostOrCoHost
                    ? 'Click "Assign Deadline" above or choose a member from the right panel to assign a specific task.'
                    : 'The room host has not assigned any tasks yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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

          {/* Right Column (1/3 width): Room Members List with direct 1-click Assign Buttons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Room Members ({room.members.length})
                </h2>
              </div>
            </div>

            <div className="rounded-xl card-white p-4 space-y-3">
              <div className="text-xs text-slate-500 font-medium">
                Engineers in this room:
              </div>

              <div className="divide-y divide-slate-100">
                {room.members.map((member) => {
                  const isMe = member.id === currentUser?.memberId;
                  const isPrimaryHost = member.role === 'HOST';

                  return (
                    <div key={member.id} className="py-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm">
                              {member.avatar}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                member.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                              <span>{member.name}</span>
                              {isMe && (
                                <span className="text-[9px] px-1 rounded bg-slate-100 text-slate-600 font-semibold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {member.department || 'Engineer'}
                            </div>
                          </div>
                        </div>

                        {/* Role Chip */}
                        {member.role === 'HOST' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                            <Crown className="w-3 h-3 text-amber-600" /> Host
                          </span>
                        ) : member.role === 'CO_HOST' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-0.5">
                            <Shield className="w-3 h-3 text-purple-600" /> Co-Host
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                            Member
                          </span>
                        )}
                      </div>

                      {/* Host action for this specific member */}
                      {isHostOrCoHost && !isMe && (
                        <div className="flex items-center gap-1.5 pl-10">
                          <button
                            onClick={() => openAssignModalForMember(member.id)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Assign Deadline</span>
                          </button>

                          {isPrimaryHost && (
                            member.role === 'MEMBER' ? (
                              <button
                                onClick={() => handleRoleChange(member.id, 'CO_HOST')}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                              >
                                Make Co-Host
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRoleChange(member.id, 'MEMBER')}
                                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer"
                              >
                                Demote
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Live Submissions Matrix Grid */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                All Deliverables &amp; Submissions Grid
              </h2>
            </div>
          </div>

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
        </div>
      </main>

      {/* Modals */}
      <JoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        roomCode={room.code}
        defaultDepartment={room.department}
        onJoinSuccess={handleJoinSuccess}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setPreselectedMemberId(undefined);
        }}
        roomCode={room.code}
        actorId={currentUser?.memberId || ''}
        members={room.members}
        onTaskCreated={fetchRoomData}
        initialMemberId={preselectedMemberId}
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
