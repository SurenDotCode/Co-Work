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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/30 text-amber-300 border border-amber-800/40">
            <Crown className="w-3 h-3 text-amber-400" />
            Host
          </span>
        );
      case 'CO_HOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950/30 text-purple-300 border border-purple-800/40">
            <Shield className="w-3 h-3 text-purple-400" />
            Co-Host
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
            <User className="w-3 h-3 text-neutral-400" />
            Member
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl panel p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#222226]">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Room Members</span>
            <span className="px-2 py-0.2 rounded text-xs font-mono bg-neutral-800 text-neutral-300">
              {members.length}
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Engineers &amp; designers connected to this room
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#1e1e24]">
        {members.map((m) => {
          const isMe = m.id === currentMemberId;
          const isPrimaryHost = m.role === 'HOST';

          return (
            <div
              key={m.id}
              className="py-3 flex items-center justify-between gap-3 px-1"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg bg-[#18181c] border border-[#27272a] flex items-center justify-center text-base select-none">
                    {m.avatar}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111114] ${
                      m.isOnline ? 'bg-emerald-500' : 'bg-neutral-600'
                    }`}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {m.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-blue-400 font-mono">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5">
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
                        className="px-2 py-1 rounded text-[10px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors cursor-pointer"
                      >
                        + Make Co-Host
                      </button>
                    ) : (
                      <button
                        onClick={() => onRoleChange(m.id, 'MEMBER')}
                        className="px-2 py-1 rounded text-[10px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 transition-colors cursor-pointer"
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
