'use client';

import React from 'react';
import { Shield, User, Crown } from 'lucide-react';
import { Member, Role } from '@/lib/types';

interface MemberListProps {
  members: Member[];
  currentMemberId: string;
  isHostOrCoHost: boolean;
  onRoleChange: (memberId: string, newRole: Role) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentMemberId,
  isHostOrCoHost,
  onRoleChange,
}) => {
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'HOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Crown className="w-3 h-3 text-amber-600" />
            Host
          </span>
        );
      case 'CO_HOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <Shield className="w-3 h-3 text-purple-600" />
            Co-Host
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
            <User className="w-3 h-3 text-slate-500" />
            Member
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl card-white p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Room Members</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {members.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Engineers connected to this workspace
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {members.map((m) => {
          const isMe = m.id === currentMemberId;
          const isPrimaryHost = m.role === 'HOST';

          return (
            <div
              key={m.id}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm select-none">
                    {m.avatar}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      m.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {m.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {m.department || 'Engineering'} {m.empId ? `• ${m.empId}` : ''}
                  </div>
                </div>
              </div>

              {/* Role badge and Host Delegation */}
              <div className="flex items-center gap-2">
                {getRoleBadge(m.role)}

                {isHostOrCoHost && !isPrimaryHost && !isMe && (
                  <div>
                    {m.role === 'MEMBER' ? (
                      <button
                        onClick={() => onRoleChange(m.id, 'CO_HOST')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Make Co-Host
                      </button>
                    ) : (
                      <button
                        onClick={() => onRoleChange(m.id, 'MEMBER')}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Remove Co-Host
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
