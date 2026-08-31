'use client';

import React, { useState } from 'react';
import { Clock, FileSpreadsheet, FileCode2, FileText, Users, User, X, Calendar, Plus, Check } from 'lucide-react';
import { DeliverableType, TaskPriority, Member } from '@/lib/types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  actorId: string;
  members: Member[];
  onTaskCreated: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  actorId,
  members,
  onTaskCreated,
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
  const [assignmentMode, setAssignmentMode] = useState<'ALL' | 'INDIVIDUAL'>('INDIVIDUAL');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    members.filter((m) => m.role === 'MEMBER').map((m) => m.id).slice(0, 1)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const setQuickDueTime = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setDueDateTime(d.toISOString().slice(0, 16));
  };

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) return; // keep at least one selected
      setSelectedMemberIds(selectedMemberIds.filter((m) => m !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const selectSingleMember = (id: string) => {
    setSelectedMemberIds([id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    if (assignmentMode === 'INDIVIDUAL' && selectedMemberIds.length === 0) {
      setError('Please select at least one member to assign this deadline to.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-[#111114] border border-[#27272a] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-[#222226]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Assign Deadline & Deliverable
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Set title, due date, and assign to individual member or the whole group.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Task / Document Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Die Clearance Phase 4 Sheet or Stamping Spec"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-minimal text-white placeholder:text-neutral-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
              Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Provide exact guidelines, required columns, or target parameters..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg input-minimal text-white placeholder:text-neutral-500 resize-none"
            />
          </div>

          {/* Individual vs Group Assignment Selector */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1.5">
              Assignee Target *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAssignmentMode('INDIVIDUAL')}
                className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  assignmentMode === 'INDIVIDUAL'
                    ? 'bg-blue-600/15 border-blue-500/60 text-white'
                    : 'bg-[#18181b] border-[#27272a] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Individual Member(s)
                </span>
                {assignmentMode === 'INDIVIDUAL' && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>

              <button
                type="button"
                onClick={() => setAssignmentMode('ALL')}
                className={`py-2 px-3 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  assignmentMode === 'ALL'
                    ? 'bg-blue-600/15 border-blue-500/60 text-white'
                    : 'bg-[#18181b] border-[#27272a] text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  All Room Members ({members.length})
                </span>
                {assignmentMode === 'ALL' && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </button>
            </div>

            {/* Individual Member List Selection */}
            {assignmentMode === 'INDIVIDUAL' && (
              <div className="p-2.5 rounded-lg bg-[#0c0c0e] border border-[#222226] space-y-1.5">
                <div className="text-[11px] text-neutral-400 font-medium px-1 flex items-center justify-between">
                  <span>Select member(s) responsible for this file:</span>
                  <span className="text-blue-400 font-semibold">{selectedMemberIds.length} selected</span>
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
                            ? 'bg-[#1e1e24] border-blue-500/40 text-white'
                            : 'bg-transparent border-transparent hover:bg-neutral-800/50 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm">{m.avatar}</span>
                          <div className="min-w-0">
                            <span className="font-semibold block truncate text-xs">{m.name}</span>
                            <span className="text-[10px] text-neutral-500 truncate block">
                              {m.department || 'Engineer'} {m.empId ? `• ${m.empId}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectSingleMember(m.id);
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
                          >
                            Only this member
                          </button>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-neutral-700 text-blue-600 focus:ring-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Deliverable Type Picker */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1.5">
              Required Deliverable Format
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
                        ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                        : 'bg-[#141418] border-[#27272a] text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline & Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-neutral-300 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                Due Date & Time *
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuickDueTime(0.75)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  +45m
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueTime(3)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                >
                  +3h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueTime(24)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
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
              className="w-full px-3 py-2 rounded-lg input-minimal text-white"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block font-semibold text-neutral-300 mb-1">
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
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                    priority === p.val
                      ? 'bg-neutral-800 border-neutral-500 text-white'
                      : 'bg-[#141418] border-[#27272a] text-neutral-400 hover:text-neutral-300'
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
            className="w-full mt-3 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Assigning...</span>
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
