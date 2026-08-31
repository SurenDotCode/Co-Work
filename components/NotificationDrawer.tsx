'use client';

import React from 'react';
import { Bell, X, CheckCircle2, AlertTriangle, FileSpreadsheet, Sparkles, UserPlus, Clock } from 'lucide-react';
import { NotificationItem } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentMemberId?: string;
  onMarkAllRead?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  currentMemberId,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'SUBMISSION':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'NUDGE':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'OVERDUE':
        return <Clock className="w-4 h-4 text-rose-400" />;
      case 'ROLE_CHANGE':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'TASK_CREATED':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <UserPlus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Live Activity & Pings</h3>
                <span className="text-[11px] text-slate-400">{notifications.length} alerts recorded</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No notifications yet in this room.
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = currentMemberId ? !notif.readBy.includes(currentMemberId) : false;
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      notif.type === 'NUDGE'
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : notif.type === 'SUBMISSION'
                        ? 'bg-emerald-950/15 border-emerald-500/30'
                        : isUnread
                        ? 'bg-slate-900 border-blue-500/40'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-white truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Real-time instant room event log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
