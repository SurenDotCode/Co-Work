import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeliverableType, ExcelPreviewData } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode(prefix = 'CW'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}

export function formatTimeRemaining(dueDateTime: string): {
  text: string;
  isOverdue: boolean;
  isUrgent: boolean; // < 1 hour
  percentageLeft?: number;
} {
  const now = new Date().getTime();
  const due = new Date(dueDateTime).getTime();
  const diffMs = due - now;

  if (isNaN(due)) {
    return { text: 'No deadline', isOverdue: false, isUrgent: false };
  }

  if (diffMs <= 0) {
    const overdueMins = Math.floor(Math.abs(diffMs) / (1000 * 60));
    if (overdueMins < 60) {
      return { text: `Overdue by ${overdueMins}m`, isOverdue: true, isUrgent: true };
    }
    const overdueHours = Math.floor(overdueMins / 60);
    if (overdueHours < 24) {
      return { text: `Overdue by ${overdueHours}h`, isOverdue: true, isUrgent: true };
    }
    const overdueDays = Math.floor(overdueHours / 24);
    return { text: `Overdue by ${overdueDays}d`, isOverdue: true, isUrgent: true };
  }

  const remainingMins = Math.floor(diffMs / (1000 * 60));
  if (remainingMins < 60) {
    return { 
      text: `Due in ${remainingMins}m`, 
      isOverdue: false, 
      isUrgent: true 
    };
  }

  const remainingHours = Math.floor(remainingMins / 60);
  if (remainingHours < 24) {
    const mins = remainingMins % 60;
    return { 
      text: `Due in ${remainingHours}h ${mins > 0 ? `${mins}m` : ''}`, 
      isOverdue: false, 
      isUrgent: remainingHours < 3 
    };
  }

  const remainingDays = Math.floor(remainingHours / 24);
  return { 
    text: `Due in ${remainingDays}d ${remainingHours % 24}h`, 
    isOverdue: false, 
    isUrgent: false 
  };
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function generateSampleExcelPreview(fileName: string, taskTitle: string): ExcelPreviewData {
  const isDieTask = /die|mold|stamp|clearance|punch/i.test(taskTitle) || /die|cad|step/i.test(fileName);
  
  if (isDieTask) {
    return {
      sheetName: 'Die_Tolerance_Inspection',
      columns: ['Component_ID', 'Zone', 'Target_Clearance_mm', 'Actual_Measured_mm', 'Deviation_mm', 'Material_Grade', 'Status'],
      rows: [
        { Component_ID: 'DIE-STP-01', Zone: 'Punch Outer Radius', Target_Clearance_mm: 0.85, Actual_Measured_mm: 0.84, Deviation_mm: -0.01, Material_Grade: 'D2 Tool Steel', Status: 'PASSED' },
        { Component_ID: 'DIE-STP-02', Zone: 'Draw Ring Flange', Target_Clearance_mm: 1.20, Actual_Measured_mm: 1.22, Deviation_mm: +0.02, Material_Grade: 'Cr12MoV', Status: 'PASSED' },
        { Component_ID: 'DIE-STP-03', Zone: 'Blanking Cavity A', Target_Clearance_mm: 0.45, Actual_Measured_mm: 0.49, Deviation_mm: +0.04, Material_Grade: 'SKD11 High Hardness', Status: 'TOLERANCE_WARNING' },
        { Component_ID: 'DIE-STP-04', Zone: 'Guide Bushing Pin', Target_Clearance_mm: 2.00, Actual_Measured_mm: 2.00, Deviation_mm: 0.00, Material_Grade: 'SUJ2 Bearing Alloy', Status: 'PASSED' },
        { Component_ID: 'DIE-STP-05', Zone: 'Bottom Cushion Pad', Target_Clearance_mm: 3.50, Actual_Measured_mm: 3.48, Deviation_mm: -0.02, Material_Grade: '42CrMo4 Quenched', Status: 'PASSED' },
      ],
      summaryStats: {
        totalRows: 5,
        passedChecks: 4,
        flaggedTolerances: 1,
      }
    };
  }

  return {
    sheetName: 'Engineering_Deliverable_Matrix',
    columns: ['Item_No', 'Parameter', 'Design_Standard', 'Measured_Value', 'Unit', 'Engineer_Signoff'],
    rows: [
      { Item_No: 1, Parameter: 'Yield Strength Tensile', Design_Standard: '>= 340', Measured_Value: 362.4, Unit: 'MPa', Engineer_Signoff: 'VERIFIED' },
      { Item_No: 2, Parameter: 'Sheet Thickness (B-Pillar)', Design_Standard: '1.40 ± 0.05', Measured_Value: 1.41, Unit: 'mm', Engineer_Signoff: 'VERIFIED' },
      { Item_No: 3, Parameter: 'Springback Angle Comp', Design_Standard: '< 1.5°', Measured_Value: 1.12, Unit: 'Degrees', Engineer_Signoff: 'VERIFIED' },
      { Item_No: 4, Parameter: 'Surface Roughness Ra', Design_Standard: '<= 0.4', Measured_Value: 0.38, Unit: 'µm', Engineer_Signoff: 'VERIFIED' },
    ],
    summaryStats: {
      totalRows: 4,
      passedChecks: 4,
      flaggedTolerances: 0,
    }
  };
}

export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore audio block
  }
}
