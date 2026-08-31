'use client';

import React from 'react';
import { Shield, ShieldAlert, User, Crown, MoreVertical, CheckCircle2, Circle } from 'lucide-react';
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
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'HOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Crown className="w-3 h-3 text-amber-400" />
            Host / Dept Head
          </span>
        );
      case 'CO_HOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Shield className="w-3 h-3 text-purple-400" />
            Co-Host
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <User className="w-3 h-3 text-slate-400" />
            Engineer / Member
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>Team Roster</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {members.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active engineers & designers currently connected
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {members.map((m) => {
          const isMe = m.id === currentMemberId;
          const isPrimaryHost = m.role === 'HOST';

          return (
            <div
              key={m.id}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-900/30 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar with live pulse */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg select-none shadow-sm">
                    {m.avatar}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                      m.isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                    title={m.isOnline ? 'Online' : 'Offline'}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {m.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-semibold">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 truncate">
                      {m.department || 'Engineering'}
                    </span>
                    {m.empId && (
                      <span className="text-[10px] font-mono text-slate-500">
                        • {m.empId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role badge and Host Delegation */}
              <div className="flex items-center gap-2">
                {getRoleBadge(m.role)}

                {isHostOrCoHost && !isPrimaryHost && !isMe && (
                  <div className="relative">
                    {m.role === 'MEMBER' ? (
                      <button
                        onClick={() => onRoleChange(m.id, 'CO_HOST')}
                        title="Promote to Co-Host (grant delegation powers)"
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
                      >
                        + Make Co-Host
                      </button>
                    ) : (
                      <button
                        onClick={() => onRoleChange(m.id, 'MEMBER')}
                        title="Demote to Regular Member"
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition-all cursor-pointer"
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
