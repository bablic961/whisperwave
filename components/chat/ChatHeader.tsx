// components/chat/ChatHeader.tsx
'use client';

import { useState } from 'react';

interface ChatHeaderProps {
  chatName: string;
  membersCount: number;
  isOnline: boolean;
  onBack?: () => void;
  onSettings?: () => void;
  onSearch?: () => void;
}

export function ChatHeader({
  chatName,
  membersCount,
  isOnline,
  onBack,
  onSettings,
  onSearch,
}: ChatHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#1A1F3D]/80 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full p-2 text-[#A0AEC0] hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <div className="flex flex-col">
          <h2 className="text-lg font-semibold text-white">{chatName}</h2>
          <p className="text-xs text-[#718096]">
            {isOnline ? 'В сети' : `${membersCount} участников`}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {onSearch && (
          <button
            onClick={onSearch}
            className="rounded-full p-2 text-[#A0AEC0] hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}

        <button className="rounded-full p-2 text-[#A0AEC0] hover:bg-white/10 hover:text-white transition-colors">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {onSettings && (
          <button
            onClick={onSettings}
            className="rounded-full p-2 text-[#A0AEC0] hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
