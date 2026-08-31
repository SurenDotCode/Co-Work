export type Role = 'HOST' | 'CO_HOST' | 'MEMBER';

export type DeliverableType = 'EXCEL' | 'CAD_DIE' | 'PDF' | 'DOC' | 'ANY';

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type SubmissionStatus = 'SUBMITTED' | 'APPROVED' | 'NEEDS_REVISION' | 'PENDING';

export interface ExcelPreviewRow {
  [key: string]: string | number;
}

export interface ExcelPreviewData {
  sheetName: string;
  columns: string[];
  rows: ExcelPreviewRow[];
  summaryStats?: {
    totalRows: number;
    passedChecks?: number;
    flaggedTolerances?: number;
  };
}

export interface Submission {
  id: string;
  taskId: string;
  memberId: string;
  memberName: string;
  memberDepartment?: string;
  fileName: string;
  fileSize: string;
  fileType: DeliverableType;
  uploadedAt: string;
  status: SubmissionStatus;
  notes?: string;
  previewData?: ExcelPreviewData;
}

export interface Member {
  id: string;
  name: string;
  role: Role;
  department?: string;
  empId?: string;
  avatar: string;
  joinedAt: string;
  isOnline: boolean;
  lastActive: string;
}

export interface Task {
  id: string;
  roomCode: string;
  title: string;
  description: string;
  dueDateTime: string; // ISO String
  deliverableType: DeliverableType;
  priority: TaskPriority;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  assignedTo: 'ALL' | string[]; // 'ALL' or specific member ID(s)
  createdAt: string;
  submissions: Record<string, Submission>; // memberId -> Submission
}

export type NotificationType = 
  | 'SUBMISSION' 
  | 'NUDGE' 
  | 'OVERDUE' 
  | 'ROLE_CHANGE' 
  | 'TASK_CREATED' 
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  roomCode: string;
  type: NotificationType;
  title: string;
  message: string;
  senderName?: string;
  targetMemberId?: 'ALL' | string;
  createdAt: string;
  readBy: string[];
  actionUrl?: string;
}

export interface RoomSettings {
  allowMemberCreateTasks: boolean;
  enableNudgeAlerts: boolean;
  autoRemindBeforeMinutes: number;
}

export interface Room {
  code: string;
  name: string;
  department: string;
  plantLocation?: string;
  hostId: string;
  hostName: string;
  createdAt: string;
  members: Member[];
  tasks: Task[];
  notifications: NotificationItem[];
  settings: RoomSettings;
}

export interface ClientUserSession {
  memberId: string;
  name: string;
  role: Role;
  department?: string;
  roomCode: string;
  avatar: string;
}

// Persistent WhatsApp-style Group representation in localStorage
export interface SavedGroup {
  code: string;
  name: string;
  department: string;
  hostName: string;
  myRole: Role;
  myName: string;
  myMemberId: string;
  lastVisited: string;
}
