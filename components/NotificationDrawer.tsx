'use client';

import React from 'react';
import { Bell, X, FileSpreadsheet, AlertTriangle, Clock, Sparkles, UserPlus } from 'lucide-react';
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
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'NUDGE':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'OVERDUE':
        return <Clock className="w-4 h-4 text-red-600" />;
      case 'ROLE_CHANGE':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'TASK_CREATED':
        return <Clock className="w-4 h-4 text-emerald-600" />;
      default:
        return <UserPlus className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            </div>

            <div className="flex items-center gap-2">
              {onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No notifications in this room.
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = currentMemberId ? !notif.readBy.includes(currentMemberId) : false;
                return (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg border text-xs transition-colors ${
                      notif.type === 'NUDGE'
                        ? 'bg-amber-50 border-amber-200'
                        : notif.type === 'SUBMISSION'
                        ? 'bg-emerald-50 border-emerald-200'
                        : isUnread
                        ? 'bg-emerald-50/40 border-emerald-200 font-medium'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 truncate">{notif.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-normal">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
