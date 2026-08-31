'use client';

import React, { useState } from 'react';
import { UserCheck, ChevronDown, Sparkles, Crown, Shield, User, RefreshCw } from 'lucide-react';
import { Member, Role } from '@/lib/types';

interface UserSwitcherProps {
  members: Member[];
  currentMemberId: string;
  onSwitchUser: (member: Member) => void;
  onOpenJoinAsNew: () => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({
  members,
  currentMemberId,
  onSwitchUser,
  onOpenJoinAsNew,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentMember = members.find((m) => m.id === currentMemberId) || members[0];

  const getRoleIcon = (role?: Role) => {
    switch (role) {
      case 'HOST':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'CO_HOST':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <User className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-slate-700/80 hover:border-blue-500/50 text-slate-200 text-xs font-semibold shadow-md transition-all cursor-pointer"
        title="Switch active user identity to test different roles"
      >
        <span className="text-sm">{currentMember?.avatar || '👤'}</span>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-white leading-tight flex items-center gap-1">
            {currentMember?.name || 'Select Identity'}
            {getRoleIcon(currentMember?.role)}
          </span>
          <span className="text-[9px] text-blue-400 uppercase tracking-wider font-mono">
            {currentMember?.role || 'MEMBER'} (Demo Switcher)
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-panel-glow border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Live Role Switcher
              </span>
              <span className="text-[10px] text-blue-400">Click to switch</span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1 space-y-1">
              {members.map((m) => {
                const isSelected = m.id === currentMemberId;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSwitchUser(m);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 text-white border border-blue-500/30'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{m.avatar}</span>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {m.department || 'Design Dept'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {getRoleIcon(m.role)}
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {m.role === 'HOST' ? 'Host' : m.role === 'CO_HOST' ? 'Co-Host' : 'Member'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-1 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenJoinAsNew();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800 flex items-center gap-2 font-semibold transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>+ Join Room with New Name</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
