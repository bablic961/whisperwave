// components/chat/ChatSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Chat {
  id: string;
  type: string;
  name?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  unreadCount: number;
  membersCount: number;
  isOnline?: boolean;
  lastMessageAt: string;
}

interface User {
  id: string;
  username: string;
  avatar?: string;
}

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId?: string;
  onChatSelect: (chatId: string) => void;
  onSearch: (query: string) => void;
  searchUserQuery?: string;
  setSearchUserQuery?: (query: string) => void;
  isSearchingUser?: boolean;
  setIsSearchingUser?: (value: boolean) => void;
  searchResults?: User[];
  onUserSelect?: (user: User) => void;
}

function formatTimeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return d.toLocaleDateString('ru-RU');
}

export function ChatSidebar({ chats, activeChatId, onChatSelect, onSearch, searchUserQuery, setSearchUserQuery, isSearchingUser, setIsSearchingUser, searchResults, onUserSelect }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  // Fix: Properly handle null/undefined in search filter
  const filteredChats = chats.filter((chat) => {
    const nameMatch = chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const messageMatch = chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    return nameMatch || messageMatch;
  });

  const handleCreateDirectChat = async (userId: string, username: string) => {
    try {
      const response = await fetch('/api/chats/direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chat/${data.chat.id}`);
      }
    } catch (error) {
      console.error('Create chat error:', error);
    }
  };

  return (
    <aside className="flex w-80 flex-col border-r border-white/10 bg-[#1A1F3D]">
      {/* Header */}
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">WhisperWave</h2>
          <p className="text-xs text-[#718096]">Приватный мессенджер</p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="w-full rounded-xl bg-[#0A0E27] border border-white/10 py-2 pl-10 pr-4 text-sm text-white placeholder-[#718096] focus:outline-none focus:border-[#00D4FF]/50"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-[#718096]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#718096]">
            <p>Нет чатов</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              className={`w-full rounded-xl p-3 text-left transition-colors ${
                activeChatId === chat.id
                  ? 'bg-gradient-to-r from-[#00D4FF]/10 to-[#7C3AED]/10'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={chat.avatar || '/avatar-placeholder.png'}
                    alt={chat.name || 'Чат'}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#10B981] ring-2 ring-[#1A1F3D]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {chat.name || 'Личный чат'}
                    </h3>
                    <span className="text-xs text-[#718096]">
                      {chat.lastMessageAt ? formatTimeAgo(chat.lastMessageAt) : ''}
                    </span>
                  </div>

                  <p className="truncate text-xs text-[#A0AEC0]">
                    {chat.lastMessage?.content || 'Начните разговор'}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="flex-shrink-0 ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#00D4FF] text-xs font-bold text-white">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Search users */}
      {isSearchingUser && searchResults && (
        <div className="border-t border-white/10 p-4 bg-[#1A1F3D]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Найденные пользователи</h3>
            <button onClick={() => setIsSearchingUser?.(false)} className="text-xs text-[#A0AEC0] hover:text-white">
              Закрыть
            </button>
          </div>
          <div className="space-y-2">
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onUserSelect?.(u);
                  handleCreateDirectChat(u.id, u.username);
                }}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <img
                  src={u.avatar || '/avatar-placeholder.png'}
                  alt={u.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{u.username}</p>
                </div>
                <svg className="h-4 w-4 text-[#718096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User info */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <img
              src={user?.avatar || '/avatar-placeholder.png'}
              alt={user?.username || 'Я'}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-[#1A1F3D]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.username}</p>
            <p className="truncate text-xs text-[#718096]">{user?.email}</p>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSearchingUser?.(true)}
              className="rounded-full p-1.5 text-[#A0AEC0] hover:bg-white/10 hover:text-white transition-colors"
              title="Найти пользователя"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="rounded-full p-1.5 text-[#A0AEC0] hover:bg-white/10 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
