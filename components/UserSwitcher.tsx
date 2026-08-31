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
        return <Crown className="w-3 h-3 text-amber-400" />;
      case 'CO_HOST':
        return <Shield className="w-3 h-3 text-purple-400" />;
      default:
        return <User className="w-3 h-3 text-neutral-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#18181c] border border-[#27272a] hover:border-neutral-500 text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
        title="Switch user identity for testing"
      >
        <span>{currentMember?.avatar || '👤'}</span>
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
            {currentMember?.name || 'User'}
            {getRoleIcon(currentMember?.role)}
          </span>
        </div>
        <ChevronDown className="w-3 h-3 text-neutral-400 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-64 rounded-xl bg-[#111114] border border-[#27272a] shadow-2xl p-1.5 z-50">
            <div className="px-2.5 py-1.5 border-b border-[#202024] text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="font-semibold text-neutral-300">Identity Switcher</span>
              <span className="text-[10px] text-neutral-500">Demo control</span>
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
                    className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 text-white font-medium'
                        : 'hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{m.avatar}</span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.name}</div>
                        <div className="text-[10px] text-neutral-500 truncate">
                          {m.department || 'Engineer'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 uppercase">
                      {m.role === 'HOST' ? 'Host' : m.role === 'CO_HOST' ? 'Co-Host' : 'Member'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-[#202024] pt-1 mt-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenJoinAsNew();
                }}
                className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-blue-400 hover:text-blue-300 hover:bg-neutral-800 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
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
