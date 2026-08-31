'use client';

import React, { useState, useEffect } from 'react';
import { Clock, FileSpreadsheet, FileCode2, FileText, Users, User, X, Calendar, Plus, Check } from 'lucide-react';
import { DeliverableType, TaskPriority, Member } from '@/lib/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  actorId: string;
  members: Member[];
  onTaskCreated: () => void;
  initialMemberId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  actorId,
  members,
  onTaskCreated,
  initialMemberId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deliverableType, setDeliverableType] = useState<DeliverableType>('EXCEL');
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  
  const getDefaultDue = () => {
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [dueDateTime, setDueDateTime] = useState(getDefaultDue());
  const [assignmentMode, setAssignmentMode] = useState<'INDIVIDUAL' | 'ALL'>('INDIVIDUAL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle pre-selected member when opened directly from a member card
  useEffect(() => {
    if (initialMemberId) {
      setAssignmentMode('INDIVIDUAL');
      setSelectedMemberIds([initialMemberId]);
    } else if (members.length > 0 && selectedMemberIds.length === 0) {
      const firstMember = members.find((m) => m.role === 'MEMBER') || members[0];
      setSelectedMemberIds([firstMember.id]);
    }
  }, [initialMemberId, members, isOpen]);

  if (!isOpen) return null;

  const setQuickDueTime = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setDueDateTime(d.toISOString().slice(0, 16));
  };

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) return;
      setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const selectOnlyMember = (id: string) => {
    setSelectedMemberIds([id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    if (assignmentMode === 'INDIVIDUAL' && selectedMemberIds.length === 0) {
      setError('Please select at least one member.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/rooms/${roomCode}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId,
          title: title.trim(),
          description: description.trim(),
          dueDateTime: new Date(dueDateTime).toISOString(),
          deliverableType,
          priority,
          assignedTo: assignmentMode === 'ALL' ? 'ALL' : selectedMemberIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create task.');
      }

      onTaskCreated();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 p-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Assign Deadline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign a deliverable to an individual member or everyone in the room.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Target Assignee Selector */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Assign To *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAssignmentMode('INDIVIDUAL')}
                className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  assignmentMode === 'INDIVIDUAL'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  Specific Member(s)
                </span>
                {assignmentMode === 'INDIVIDUAL' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode('ALL')}
                className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  assignmentMode === 'ALL'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-600" />
                  All Room Members ({members.length})
                </span>
                {assignmentMode === 'ALL' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </button>
            </div>

            {/* Individual Member List Selection */}
            {assignmentMode === 'INDIVIDUAL' && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between">
                  <span>Select which engineer is responsible:</span>
                  <span className="text-emerald-700 font-semibold">{selectedMemberIds.length} selected</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {members.map((m) => {
                    const isSelected = selectedMemberIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleMember(m.id)}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition-colors ${
                          isSelected
                            ? 'bg-white border-emerald-500 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">{m.avatar}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs">{m.name}</span>
                            <span className="text-[10px] text-slate-500 truncate block">
                              {m.department || 'Engineer'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectOnlyMember(m.id);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                          >
                            Only this person
                          </button>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Die Clearance Phase 4 Sheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-clean text-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Notes or Guidelines (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Instructions, punch tolerance parameters, standard formats..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-clean text-slate-900 resize-none"
            />
          </div>

          {/* Deliverable Type Picker */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5">
              Deliverable Format
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'EXCEL', label: 'Excel Sheet', icon: FileSpreadsheet },
                { type: 'CAD_DIE', label: 'CAD / Die', icon: FileCode2 },
                { type: 'PDF', label: 'PDF Doc', icon: FileText },
                { type: 'ANY', label: 'Any File', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = deliverableType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setDeliverableType(item.type as DeliverableType)}
                    className={`py-2 px-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Due Date & Time *
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuickDueTime(0.75)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +45m
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueTime(3)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +3h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueTime(24)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +24h
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={dueDateTime}
              onChange={(e) => setDueDateTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-clean text-slate-900"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 'LOW', label: 'Low' },
                { val: 'NORMAL', label: 'Normal' },
                { val: 'HIGH', label: 'High' },
                { val: 'URGENT', label: 'Urgent 🚨' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setPriority(p.val as TaskPriority)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-semibold transition-colors ${
                    priority === p.val
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Assigning Deadline...</span>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Deadline</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
