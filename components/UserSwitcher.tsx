'use client';

import React, { useState } from 'react';
import { ChevronDown, Crown, Shield, User, UserCheck } from 'lucide-react';
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
        return <Crown className="w-3 h-3 text-amber-600" />;
      case 'CO_HOST':
        return <Shield className="w-3 h-3 text-purple-600" />;
      default:
        return <User className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        title="Switch user identity for testing"
      >
        <span>{currentMember?.avatar || '👤'}</span>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
            {currentMember?.name || 'User'}
            {getRoleIcon(currentMember?.role)}
          </span>
        </div>
        <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50">
            <div className="px-2.5 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-bold text-slate-700">Identity Switcher</span>
              <span className="text-[10px] text-slate-400">Demo toggle</span>
            </div>

            <div className="max-h-52 overflow-y-auto py-1 space-y-0.5">
              {members.map((m) => {
                const isSelected = m.id === currentMemberId;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onSwitchUser(m);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{m.avatar}</span>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {m.department || 'Engineer'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase">
                      {m.role === 'HOST' ? 'Host' : m.role === 'CO_HOST' ? 'Co-Host' : 'Member'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-1 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenJoinAsNew();
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5 font-semibold transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>+ Join as New Name</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
