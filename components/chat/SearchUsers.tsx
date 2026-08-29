// components/chat/SearchUsers.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';

interface User {
  id: string;
  username: string;
  avatar?: string;
  status: string;
  isOnline?: boolean;
  lastSeen: string;
  bio?: string;
}

interface SearchUsersProps {
  onUserSelect: (user: User) => void;
  onClose: () => void;
}

export function SearchUsers({ onUserSelect, onClose }: SearchUsersProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setUsers([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out current user
          const filtered = data.users.filter((u: User) => u.id !== user?.id);
          setUsers(filtered);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1F3D] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4">
        <input
          type="text"
          placeholder="Введите имя пользователя..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-[#0A0E27] border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]"
          autoFocus
        />
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-[#718096]">
            Поиск...
          </div>
        ) : hasSearched && users.length === 0 ? (
          <div className="p-4 text-center text-[#718096]">
            Пользователь не найден
          </div>
        ) : (
          users.map((u) => (
            <button
              key={u.id}
              onClick={() => onUserSelect(u)}
              className="w-full flex items-center space-x-3 p-3 hover:bg-white/5 transition-colors"
            >
              <img
                src={u.avatar || '/avatar-placeholder.png'}
                alt={u.username}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{u.username}</p>
                <p className="text-xs text-[#718096] truncate">
                  {u.status === 'ONLINE' ? 'В сети' : `Был(а) ${new Date(u.lastSeen).toLocaleDateString('ru-RU')}`}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
