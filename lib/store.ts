import fs from 'fs';
import path from 'path';
import { Room, Member, Task, Submission, NotificationItem, Role, DeliverableType } from './types';
import { generateSampleExcelPreview } from './utils';

declare global {
  // eslint-disable-next-line no-var
  var __COWORK_ROOMS__: Map<string, Room> | undefined;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rooms.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize data file:', err);
  }
}

function loadRoomsFromDisk(): Map<string, Room> {
  const map = new Map<string, Room>();
  try {
    ensureDataFile();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      if (content && content.trim()) {
        const obj = JSON.parse(content);
        Object.keys(obj).forEach((code) => {
          map.set(code.toUpperCase(), obj[code]);
        });
      }
    }
  } catch (err) {
    console.error('Error reading rooms from disk:', err);
  }
  return map;
}

function saveRoomsToDisk(map: Map<string, Room>) {
  try {
    ensureDataFile();
    const obj: Record<string, Room> = {};
    map.forEach((room, code) => {
      obj[code.toUpperCase()] = room;
    });
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving rooms to disk:', err);
  }
}

function getRoomsMap(): Map<string, Room> {
  if (!global.__COWORK_ROOMS__) {
    global.__COWORK_ROOMS__ = loadRoomsFromDisk();
  }
  return global.__COWORK_ROOMS__;
}

export function getRoom(code: string): Room | null {
  const map = getRoomsMap();
  const normalized = code.trim().toUpperCase();
  
  if (!map.has(normalized)) {
    const diskMap = loadRoomsFromDisk();
    if (diskMap.has(normalized)) {
      map.set(normalized, diskMap.get(normalized)!);
    }
  }
  
  return map.get(normalized) || null;
}

export function listPublicRooms(): { code: string; name: string; department: string; memberCount: number; activeTasks: number }[] {
  const map = getRoomsMap();
  const result: { code: string; name: string; department: string; memberCount: number; activeTasks: number }[] = [];
  map.forEach((room) => {
    result.push({
      code: room.code,
      name: room.name,
      department: room.department,
      memberCount: room.members.length,
      activeTasks: room.tasks.length,
    });
  });
  return result;
}

export function createRoom(params: {
  name: string;
  department: string;
  hostName: string;
  customCode?: string;
  plantLocation?: string;
}): { room: Room; hostMember: Member } {
  const map = getRoomsMap();
  const code = (params.customCode && params.customCode.trim().length >= 3)
    ? params.customCode.trim().toUpperCase()
    : `TM-${Math.floor(1000 + Math.random() * 9000)}`;

  const hostId = `mem_host_${Date.now()}`;
  const hostMember: Member = {
    id: hostId,
    name: params.hostName.trim(),
    role: 'HOST',
    department: params.department.trim() || 'Head of Department',
    avatar: '👑',
    joinedAt: new Date().toISOString(),
    isOnline: true,
    lastActive: new Date().toISOString(),
  };

  const initialNotification: NotificationItem = {
    id: `notif_${Date.now()}`,
    roomCode: code,
    type: 'SYSTEM',
    title: 'Room Created',
    message: `Room "${params.name}" was initialized by ${params.hostName}. Share code #${code} with your team members!`,
    createdAt: new Date().toISOString(),
    readBy: [hostId],
  };

  const room: Room = {
    code,
    name: params.name.trim(),
    department: params.department.trim(),
    plantLocation: params.plantLocation || 'Design & Engineering Department',
    hostId,
    hostName: params.hostName.trim(),
    createdAt: new Date().toISOString(),
    members: [hostMember],
    tasks: [],
    notifications: [initialNotification],
    settings: {
      allowMemberCreateTasks: false, // Strict: Host only
      enableNudgeAlerts: true,
      autoRemindBeforeMinutes: 30,
    },
  };

  map.set(code, room);
  saveRoomsToDisk(map);
  return { room, hostMember };
}

export function joinRoom(params: {
  code: string;
  name: string;
  department?: string;
  empId?: string;
  avatar?: string;
}): { room: Room; member: Member } | { error: string } {
  const map = getRoomsMap();
  const normalized = params.code.trim().toUpperCase();
  let room = map.get(normalized);

  if (!room) {
    const diskMap = loadRoomsFromDisk();
    room = diskMap.get(normalized);
    if (room) {
      map.set(normalized, room);
    }
  }

  if (!room) {
    return { error: `Room "${normalized}" not found. Please check the code or create a new room.` };
  }

  const existing = room.members.find(
    (m) => m.name.trim().toLowerCase() === params.name.trim().toLowerCase()
  );

  if (existing) {
    existing.isOnline = true;
    existing.lastActive = new Date().toISOString();
    if (params.department && params.department.trim()) {
      existing.department = params.department.trim();
    }
    saveRoomsToDisk(map);
    return { room, member: existing };
  }

  const avatars = ['⚡', '⚙️', '📐', '🔬', '🔧', '🚀', '💡', '📊', '👨‍💻', '👩‍💻'];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const newMember: Member = {
    id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: params.name.trim(),
    role: 'MEMBER',
    department: params.department?.trim() || 'Team Member',
    empId: params.empId?.trim(),
    avatar: params.avatar || randomAvatar,
    joinedAt: new Date().toISOString(),
    isOnline: true,
    lastActive: new Date().toISOString(),
  };

  room.members.push(newMember);

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: normalized,
    type: 'SYSTEM',
    title: 'New Member Joined',
    message: `${newMember.name} (${newMember.department}) joined the room.`,
    senderName: newMember.name,
    createdAt: new Date().toISOString(),
    readBy: [],
  });

  saveRoomsToDisk(map);
  return { room, member: newMember };
}

export function updateMemberRole(params: {
  code: string;
  targetMemberId: string;
  newRole: Role;
  actorId: string;
}): { success: boolean; room?: Room; error?: string } {
  const map = getRoomsMap();
  const room = map.get(params.code.trim().toUpperCase());
  if (!room) return { success: false, error: 'Room not found' };

  const actor = room.members.find((m) => m.id === params.actorId);
  if (!actor || (actor.role !== 'HOST' && actor.role !== 'CO_HOST')) {
    return { success: false, error: 'Unauthorized: Only Host or Co-Host can modify roles.' };
  }

  const target = room.members.find((m) => m.id === params.targetMemberId);
  if (!target) return { success: false, error: 'Target member not found' };

  if (target.role === 'HOST' && params.actorId !== room.hostId) {
    return { success: false, error: 'Cannot demote the primary Host.' };
  }

  target.role = params.newRole;
  if (params.newRole === 'CO_HOST') {
    target.avatar = '🛡️';
  } else if (params.newRole === 'MEMBER' && target.avatar === '🛡️') {
    target.avatar = '⚡';
  }

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: room.code,
    type: 'ROLE_CHANGE',
    title: 'Role Updated',
    message: `${target.name} is now a ${params.newRole === 'CO_HOST' ? 'Co-Host 🛡️' : 'Team Member 👤'}.`,
    senderName: actor.name,
    createdAt: new Date().toISOString(),
    readBy: [],
  });

  saveRoomsToDisk(map);
  return { success: true, room };
}

export function createTask(params: {
  code: string;
  actorId: string;
  title: string;
  description: string;
  dueDateTime: string;
  deliverableType: DeliverableType;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  assignedTo?: 'ALL' | string[];
}): { success: boolean; task?: Task; room?: Room; error?: string } {
  const map = getRoomsMap();
  const room = map.get(params.code.trim().toUpperCase());
  if (!room) return { success: false, error: 'Room not found' };

  const actor = room.members.find((m) => m.id === params.actorId);
  if (!actor) return { success: false, error: 'Member not found in room.' };

  // STRICT PERMISSION: Only Host or Co-Host can assign deadlines
  if (actor.role !== 'HOST' && actor.role !== 'CO_HOST') {
    return { success: false, error: 'Unauthorized: Only the Room Host or Co-Host can assign deadlines.' };
  }

  const newTask: Task = {
    id: `task_${Date.now()}`,
    roomCode: room.code,
    title: params.title.trim(),
    description: params.description.trim(),
    dueDateTime: params.dueDateTime,
    deliverableType: params.deliverableType,
    priority: params.priority,
    createdBy: {
      id: actor.id,
      name: actor.name,
      role: actor.role,
    },
    assignedTo: params.assignedTo && params.assignedTo.length > 0 ? params.assignedTo : 'ALL',
    createdAt: new Date().toISOString(),
    submissions: {},
  };

  room.tasks.unshift(newTask);

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: room.code,
    type: 'TASK_CREATED',
    title: 'New Deadline Assigned',
    message: `${actor.name} assigned: "${newTask.title}".`,
    senderName: actor.name,
    createdAt: new Date().toISOString(),
    readBy: [actor.id],
  });

  saveRoomsToDisk(map);
  return { success: true, task: newTask, room };
}

export function deleteTask(params: {
  code: string;
  taskId: string;
  actorId: string;
}): { success: boolean; room?: Room; error?: string } {
  const map = getRoomsMap();
  const room = map.get(params.code.trim().toUpperCase());
  if (!room) return { success: false, error: 'Room not found' };

  const actor = room.members.find((m) => m.id === params.actorId);
  if (!actor || (actor.role !== 'HOST' && actor.role !== 'CO_HOST')) {
    return { success: false, error: 'Only Host or Co-Host can delete deadlines.' };
  }

  room.tasks = room.tasks.filter((t) => t.id !== params.taskId);
  saveRoomsToDisk(map);
  return { success: true, room };
}

export function submitDeliverable(params: {
  code: string;
  taskId: string;
  memberId: string;
  fileName: string;
  fileSize?: string;
  fileType?: DeliverableType;
  notes?: string;
}): { success: boolean; submission?: Submission; room?: Room; error?: string } {
  const map = getRoomsMap();
  const room = map.get(params.code.trim().toUpperCase());
  if (!room) return { success: false, error: 'Room not found' };

  const member = room.members.find((m) => m.id === params.memberId);
  if (!member) return { success: false, error: 'Member not found in room.' };

  const task = room.tasks.find((t) => t.id === params.taskId);
  if (!task) return { success: false, error: 'Task not found in room.' };

  const preview = generateSampleExcelPreview(params.fileName, task.title);

  const submission: Submission = {
    id: `sub_${Date.now()}`,
    taskId: task.id,
    memberId: member.id,
    memberName: member.name,
    memberDepartment: member.department,
    fileName: params.fileName,
    fileSize: params.fileSize || '1.8 MB',
    fileType: params.fileType || task.deliverableType,
    uploadedAt: new Date().toISOString(),
    status: 'SUBMITTED',
    notes: params.notes,
    previewData: preview,
  };

  task.submissions[member.id] = submission;

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: room.code,
    type: 'SUBMISSION',
    title: 'Deliverable Received',
    message: `${member.name} submitted "${submission.fileName}" for "${task.title}".`,
    senderName: member.name,
    createdAt: new Date().toISOString(),
    readBy: [member.id],
  });

  saveRoomsToDisk(map);
  return { success: true, submission, room };
}

export function sendNudge(params: {
  code: string;
  actorId: string;
  taskId?: string;
  customMessage?: string;
}): { success: boolean; room?: Room; countNudged: number; error?: string } {
  const map = getRoomsMap();
  const room = map.get(params.code.trim().toUpperCase());
  if (!room) return { success: false, countNudged: 0, error: 'Room not found' };

  const actor = room.members.find((m) => m.id === params.actorId);
  if (!actor || (actor.role !== 'HOST' && actor.role !== 'CO_HOST')) {
    return { success: false, countNudged: 0, error: 'Only Host or Co-Host can send nudges.' };
  }

  let countNudged = 0;
  let taskTitle = 'all open tasks';

  if (params.taskId) {
    const task = room.tasks.find((t) => t.id === params.taskId);
    if (task) {
      taskTitle = `"${task.title}"`;
      const eligibleMembers = task.assignedTo === 'ALL'
        ? room.members.filter((m) => m.role === 'MEMBER')
        : room.members.filter((m) => Array.isArray(task.assignedTo) && task.assignedTo.includes(m.id));

      eligibleMembers.forEach((m) => {
        if (!task.submissions[m.id]) countNudged++;
      });
    }
  } else {
    countNudged = room.members.filter((m) => m.role === 'MEMBER').length;
  }

  const message = params.customMessage || 
    `Reminder from ${actor.name}: Please submit your pending deliverables for ${taskTitle}.`;

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: room.code,
    type: 'NUDGE',
    title: 'Deadline Reminder',
    message,
    senderName: actor.name,
    createdAt: new Date().toISOString(),
    readBy: [actor.id],
  });

  saveRoomsToDisk(map);
  return { success: true, room, countNudged };
}

export function updateRoomDetails(params: {
  code: string;
  actorId: string;
  name?: string;
  department?: string;
  plantLocation?: string;
  settings?: Partial<Room['settings']>;
}): { success: boolean; room?: Room; error?: string } {
  const map = getRoomsMap();
  const room = map.get(params.code.trim().toUpperCase());
  if (!room) return { success: false, error: 'Room not found' };

  const actor = room.members.find((m) => m.id === params.actorId);
  if (!actor || actor.role !== 'HOST') {
    return { success: false, error: 'Only the primary Host can modify room settings.' };
  }

  if (params.name) room.name = params.name.trim();
  if (params.department) room.department = params.department.trim();
  if (params.plantLocation) room.plantLocation = params.plantLocation.trim();
  if (params.settings) room.settings = { ...room.settings, ...params.settings };

  saveRoomsToDisk(map);
  return { success: true, room };
}
