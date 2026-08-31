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
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
      case 'NUDGE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'OVERDUE':
        return <Clock className="w-3.5 h-3.5 text-red-400" />;
      case 'ROLE_CHANGE':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'TASK_CREATED':
        return <Clock className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <UserPlus className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-[#111114] border-l border-[#27272a] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#222226] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-300" />
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
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
                className="p-1 text-neutral-400 hover:text-white rounded-md hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">
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
                        ? 'bg-amber-950/20 border-amber-900/50'
                        : notif.type === 'SUBMISSION'
                        ? 'bg-emerald-950/20 border-emerald-900/50'
                        : isUnread
                        ? 'bg-[#18181e] border-blue-900/50'
                        : 'bg-[#141418] border-[#222226]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-white truncate">{notif.title}</h4>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {formatDateTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-400 mt-0.5 leading-normal">
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
