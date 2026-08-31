'use client';

import React, { useState } from 'react';
import { Clock, FileSpreadsheet, FileCode2, FileText, AlertCircle, Users, X, Calendar, Plus } from 'lucide-react';
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
  
  // Default due date to 2 hours from now formatted for datetime-local input
  const getDefaultDue = () => {
    const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [dueDateTime, setDueDateTime] = useState(getDefaultDue());
  const [assignedToAll, setAssignedToAll] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const setQuickDueTime = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setDueDateTime(d.toISOString().slice(0, 16));
  };

  const toggleMemberSelection = (id: string) => {
    if (selectedMembers.includes(id)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== id));
    } else {
      setSelectedMembers([...selectedMembers, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
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
          assignedTo: assignedToAll ? 'ALL' : selectedMembers,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Assign New Deadline & Deliverable
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Specify the required file format (e.g. Excel spreadsheet or CAD/Die specs) and submission deadline.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task / Sheet Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Heavy Stamping Die Clearance Sheet (Phase 4)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Specifications
            </label>
            <textarea
              rows={2}
              placeholder="Specific guidelines for engineers (e.g. include column for punch radius, material yield strength & tolerance dev)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl glass-input text-white text-xs placeholder:text-slate-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Deliverable Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Expected Deliverable Format *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'EXCEL', label: 'Excel (.xlsx/.csv)', icon: FileSpreadsheet, color: 'text-emerald-400 border-emerald-500/30' },
                { type: 'CAD_DIE', label: 'CAD / Die (.step)', icon: FileCode2, color: 'text-blue-400 border-blue-500/30' },
                { type: 'PDF', label: 'PDF Document', icon: FileText, color: 'text-rose-400 border-rose-500/30' },
                { type: 'ANY', label: 'Any File', icon: FileText, color: 'text-purple-400 border-purple-500/30' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = deliverableType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setDeliverableType(item.type as DeliverableType)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/50'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline & Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Due Date & Time *
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuickDueTime(0.75)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700"
                >
                  +45m
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueTime(3)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700"
                >
                  +3h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDueTime(24)}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700"
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
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white text-sm focus:border-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: 'LOW', label: 'Low', color: 'border-slate-600 text-slate-400' },
                { val: 'NORMAL', label: 'Normal', color: 'border-blue-500/40 text-blue-400' },
                { val: 'HIGH', label: 'High', color: 'border-amber-500/40 text-amber-400' },
                { val: 'URGENT', label: 'Urgent 🚨', color: 'border-rose-500/60 text-rose-400' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setPriority(p.val as TaskPriority)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    priority === p.val
                      ? 'bg-slate-800 ring-2 ring-blue-500 text-white'
                      : `${p.color} bg-slate-900/60 hover:bg-slate-800 opacity-60 hover:opacity-100`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Assignees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Assign To
              </label>
              <button
                type="button"
                onClick={() => setAssignedToAll(!assignedToAll)}
                className="text-[11px] text-blue-400 hover:text-blue-300 underline"
              >
                {assignedToAll ? 'Select Specific Members' : 'Assign to Everyone in Room'}
              </button>
            </div>

            {assignedToAll ? (
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>All {members.length} team members in this room will be assigned.</span>
              </div>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                {members.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer text-xs"
                  >
                    <span className="flex items-center gap-2 text-slate-200">
                      <span>{m.avatar}</span>
                      <span>{m.name}</span>
                      <span className="text-[10px] text-slate-400">({m.department})</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleMemberSelection(m.id)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !title.trim()}
            className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Assigning Deadline...</span>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Publish Deadline to Room</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
