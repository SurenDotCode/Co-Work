import { Room, Member, Task, Submission, NotificationItem, Role, DeliverableType } from './types';
import { generateSampleExcelPreview } from './utils';

// Global serverless in-memory cache to preserve state across invocations in the Node process
declare global {
  // eslint-disable-next-line no-var
  var __COWORK_ROOMS__: Map<string, Room> | undefined;
}

function getRoomsMap(): Map<string, Room> {
  if (!global.__COWORK_ROOMS__) {
    global.__COWORK_ROOMS__ = new Map<string, Room>();
    seedDefaultRooms(global.__COWORK_ROOMS__);
  }
  return global.__COWORK_ROOMS__;
}

function seedDefaultRooms(map: Map<string, Room>) {
  const now = new Date();
  
  // Task 1 Due in 45 minutes
  const task1Due = new Date(now.getTime() + 45 * 60 * 1000).toISOString();
  // Task 2 Due in 3 hours
  const task2Due = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
  // Task 3 Due tomorrow
  const task3Due = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const arunSubmission: Submission = {
    id: 'sub_arun_1',
    taskId: 'task_1',
    memberId: 'mem_arun',
    memberName: 'Arun Sharma',
    memberDepartment: 'Die Tooling Eng',
    fileName: 'Punch_Clearance_Phase4_Tata_Nexon.xlsx',
    fileSize: '1.4 MB',
    fileType: 'EXCEL',
    uploadedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    status: 'SUBMITTED',
    notes: 'Calculated at 0.85mm clearance. Skd11 alloy verified for draw ring.',
    previewData: generateSampleExcelPreview('Punch_Clearance_Phase4_Tata_Nexon.xlsx', 'Heavy Stamping Die Clearance Sheet'),
  };

  const nehaSubmission: Submission = {
    id: 'sub_neha_1',
    taskId: 'task_1',
    memberId: 'mem_neha',
    memberName: 'Neha Patel',
    memberDepartment: 'CAD/CAM Specialist',
    fileName: 'Draw_Die_Tolerances_Rev3.xlsx',
    fileSize: '2.8 MB',
    fileType: 'EXCEL',
    uploadedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    status: 'SUBMITTED',
    notes: 'All 3D CAD step surfaces aligned with stamping press 1200T specs.',
    previewData: generateSampleExcelPreview('Draw_Die_Tolerances_Rev3.xlsx', 'Heavy Stamping Die Clearance Sheet'),
  };

  const rajeshSubmission: Submission = {
    id: 'sub_rajesh_1',
    taskId: 'task_1',
    memberId: 'mem_rajesh',
    memberName: 'Rajesh Kumar',
    memberDepartment: 'Simulation FEA Analyst',
    fileName: 'Forming_Limit_Diagram_Report.xlsx',
    fileSize: '4.1 MB',
    fileType: 'EXCEL',
    uploadedAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    status: 'SUBMITTED',
    notes: 'Zero wrinkling risk detected in simulation run #48.',
    previewData: generateSampleExcelPreview('Forming_Limit_Diagram_Report.xlsx', 'Heavy Stamping Die Clearance Sheet'),
  };

  const task1: Task = {
    id: 'task_1',
    roomCode: 'TATA-DIE',
    title: 'Heavy Stamping Die Clearance Sheet (Phase 4)',
    description: 'Upload the measured die clearance and punch radius spreadsheet before 1200T press trial at Pune Plant.',
    dueDateTime: task1Due,
    deliverableType: 'EXCEL',
    priority: 'URGENT',
    createdBy: {
      id: 'mem_host_father',
      name: 'B. Yerra (Head of Design)',
      role: 'HOST',
    },
    assignedTo: 'ALL',
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    submissions: {
      mem_arun: arunSubmission,
      mem_neha: nehaSubmission,
      mem_rajesh: rajeshSubmission,
    },
  };

  const task2: Task = {
    id: 'task_2',
    roomCode: 'TATA-DIE',
    title: 'Nexon EV Door Panel Mold Shrinkage & CAD Specs',
    description: 'Submit the 3D STEP/IGES die cavity model or inspection sheet for the inner door panel stamping.',
    dueDateTime: task2Due,
    deliverableType: 'CAD_DIE',
    priority: 'HIGH',
    createdBy: {
      id: 'mem_host_father',
      name: 'B. Yerra (Head of Design)',
      role: 'HOST',
    },
    assignedTo: ['mem_neha', 'mem_karan', 'mem_ananya'],
    createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    submissions: {
      mem_neha: {
        id: 'sub_neha_2',
        taskId: 'task_2',
        memberId: 'mem_neha',
        memberName: 'Neha Patel',
        memberDepartment: 'CAD/CAM Specialist',
        fileName: 'Nexon_Door_Inner_Die_Cavity.step',
        fileSize: '18.4 MB',
        fileType: 'CAD_DIE',
        uploadedAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        status: 'SUBMITTED',
        notes: 'Includes compensated thermal shrinkage allowance of 0.12%.',
      }
    },
  };

  const task3: Task = {
    id: 'task_3',
    roomCode: 'TATA-DIE',
    title: 'Q3 Tooling Steel Grade & Hardness Audit Matrix',
    description: 'Consolidated material certs (D2, SKD11, Cr12MoV) and Rockwell hardness test sheet.',
    dueDateTime: task3Due,
    deliverableType: 'EXCEL',
    priority: 'NORMAL',
    createdBy: {
      id: 'mem_vikram',
      name: 'Vikram Malhotra',
      role: 'CO_HOST',
    },
    assignedTo: 'ALL',
    createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    submissions: {},
  };

  const members: Member[] = [
    {
      id: 'mem_host_father',
      name: 'B. Yerra (Head of Design)',
      role: 'HOST',
      department: 'Vehicle Design & Press Tooling',
      empId: 'TM-DES-001',
      avatar: '👑',
      joinedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'mem_vikram',
      name: 'Vikram Malhotra',
      role: 'CO_HOST',
      department: 'Lead Tooling Engineer',
      empId: 'TM-TL-042',
      avatar: '🛡️',
      joinedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'mem_arun',
      name: 'Arun Sharma',
      role: 'MEMBER',
      department: 'Die Tooling Eng',
      empId: 'TM-ENG-112',
      avatar: '⚡',
      joinedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'mem_neha',
      name: 'Neha Patel',
      role: 'MEMBER',
      department: 'CAD/CAM Specialist',
      empId: 'TM-CAD-209',
      avatar: '🎨',
      joinedAt: new Date(now.getTime() - 17 * 60 * 60 * 1000).toISOString(),
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'mem_rajesh',
      name: 'Rajesh Kumar',
      role: 'MEMBER',
      department: 'Simulation FEA Analyst',
      empId: 'TM-SIM-301',
      avatar: '🔬',
      joinedAt: new Date(now.getTime() - 16 * 60 * 60 * 1000).toISOString(),
      isOnline: false,
      lastActive: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: 'mem_karan',
      name: 'Karan Verma',
      role: 'MEMBER',
      department: 'Material Specs Engineer',
      empId: 'TM-MAT-419',
      avatar: '⚙️',
      joinedAt: new Date(now.getTime() - 15 * 60 * 60 * 1000).toISOString(),
      isOnline: true,
      lastActive: new Date().toISOString(),
    },
    {
      id: 'mem_ananya',
      name: 'Ananya Deshmukh',
      role: 'MEMBER',
      department: 'Quality & Tolerance Lead',
      empId: 'TM-QA-508',
      avatar: '📐',
      joinedAt: new Date(now.getTime() - 14 * 60 * 60 * 1000).toISOString(),
      isOnline: false,
      lastActive: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      roomCode: 'TATA-DIE',
      type: 'SUBMISSION',
      title: 'New Sheet Uploaded',
      message: 'Rajesh Kumar uploaded "Forming_Limit_Diagram_Report.xlsx" for Heavy Stamping Die Clearance Sheet.',
      senderName: 'Rajesh Kumar',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      readBy: [],
    },
    {
      id: 'notif_2',
      roomCode: 'TATA-DIE',
      type: 'SUBMISSION',
      title: 'New Sheet Uploaded',
      message: 'Neha Patel uploaded "Draw_Die_Tolerances_Rev3.xlsx".',
      senderName: 'Neha Patel',
      createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      readBy: ['mem_host_father'],
    },
    {
      id: 'notif_3',
      roomCode: 'TATA-DIE',
      type: 'NUDGE',
      title: '⚠️ Deadline Approaching',
      message: 'Host B. Yerra sent a reminder: "Please submit Punch Clearance Sheet before trial begins!"',
      senderName: 'B. Yerra (Head of Design)',
      createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
      readBy: [],
    }
  ];

  const tataRoom: Room = {
    code: 'TATA-DIE',
    name: 'Tata Motors — Die & Tooling Design Dept',
    department: 'Vehicle Engineering (Pune Plant)',
    plantLocation: 'Tata Motors Pune Plant - Pimpri Works',
    hostId: 'mem_host_father',
    hostName: 'B. Yerra (Head of Design)',
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    members,
    tasks: [task1, task2, task3],
    notifications,
    settings: {
      allowMemberCreateTasks: true,
      enableNudgeAlerts: true,
      autoRemindBeforeMinutes: 30,
    },
  };

  map.set('TATA-DIE', tataRoom);
}

// Database helper functions
export function getRoom(code: string): Room | null {
  const map = getRoomsMap();
  const normalized = code.trim().toUpperCase();
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
    : `CW-${Math.floor(1000 + Math.random() * 9000)}`;

  const hostId = `mem_host_${Date.now()}`;
  const hostMember: Member = {
    id: hostId,
    name: params.hostName.trim(),
    role: 'HOST',
    department: params.department.trim(),
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
    message: `Room "${params.name}" was initialized by ${params.hostName}. Share code ${code} with your team!`,
    createdAt: new Date().toISOString(),
    readBy: [hostId],
  };

  const room: Room = {
    code,
    name: params.name.trim(),
    department: params.department.trim(),
    plantLocation: params.plantLocation || 'Engineering Hub',
    hostId,
    hostName: params.hostName.trim(),
    createdAt: new Date().toISOString(),
    members: [hostMember],
    tasks: [],
    notifications: [initialNotification],
    settings: {
      allowMemberCreateTasks: true,
      enableNudgeAlerts: true,
      autoRemindBeforeMinutes: 30,
    },
  };

  map.set(code, room);
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
  const room = map.get(normalized);

  if (!room) {
    return { error: `Room "${normalized}" not found. Please verify the code or create a new room.` };
  }

  // Check if member already exists with same name
  const existing = room.members.find(
    (m) => m.name.trim().toLowerCase() === params.name.trim().toLowerCase()
  );

  if (existing) {
    existing.isOnline = true;
    existing.lastActive = new Date().toISOString();
    return { room, member: existing };
  }

  const avatars = ['⚡', '⚙️', '📐', '🔬', '🔧', '🚀', '💡', '📊', '🛡️'];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const newMember: Member = {
    id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: params.name.trim(),
    role: 'MEMBER',
    department: params.department?.trim() || room.department,
    empId: params.empId?.trim(),
    avatar: params.avatar || randomAvatar,
    joinedAt: new Date().toISOString(),
    isOnline: true,
    lastActive: new Date().toISOString(),
  };

  room.members.push(newMember);

  // Add join notification
  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: normalized,
    type: 'SYSTEM',
    title: 'New Member Joined',
    message: `${newMember.name} joined the room.`,
    senderName: newMember.name,
    createdAt: new Date().toISOString(),
    readBy: [],
  });

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
    return { success: false, error: 'Unauthorized. Only Host or Co-Host can modify roles.' };
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

  if (!room.settings.allowMemberCreateTasks && actor.role === 'MEMBER') {
    return { success: false, error: 'Only Host or Co-Host can assign deadlines in this room.' };
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
    assignedTo: params.assignedTo || 'ALL',
    createdAt: new Date().toISOString(),
    submissions: {},
  };

  room.tasks.unshift(newTask);

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: room.code,
    type: 'TASK_CREATED',
    title: 'New Deadline Assigned ⏰',
    message: `${actor.name} assigned: "${newTask.title}". Deliverable: ${newTask.deliverableType}`,
    senderName: actor.name,
    createdAt: new Date().toISOString(),
    readBy: [actor.id],
  });

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
    title: 'Deliverable Received 📥',
    message: `${member.name} submitted "${submission.fileName}" for "${task.title}".`,
    senderName: member.name,
    createdAt: new Date().toISOString(),
    readBy: [member.id],
  });

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
    // General nudge across all tasks
    countNudged = room.members.filter((m) => m.role === 'MEMBER').length;
  }

  const message = params.customMessage || 
    `🚨 ${actor.name} pinged: Please submit your pending deliverables for ${taskTitle} as soon as possible!`;

  room.notifications.unshift({
    id: `notif_${Date.now()}`,
    roomCode: room.code,
    type: 'NUDGE',
    title: '⚡ Deadline Reminder / Nudge',
    message,
    senderName: actor.name,
    createdAt: new Date().toISOString(),
    readBy: [actor.id],
  });

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

  return { success: true, room };
}
