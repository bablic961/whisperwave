// components/chat/ChatSidebarClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatSidebar as ChatSidebarComponent } from '@/components/chat/ChatSidebar';
import { SearchUsers } from './SearchUsers';

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

interface ChatSidebarClientProps {
  chats: Chat[];
}

export function ChatSidebarClient({ chats }: ChatSidebarClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const router = useRouter();

  // Real users search
  useEffect(() => {
    const searchUsers = async () => {
      if (searchUserQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchUserQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.users);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [searchUserQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const handleUserSelect = (user: User) => {
    // Create direct chat with selected user
    handleCreateDirectChat(user.id, user.username);
    setSearchUserQuery('');
    setSearchResults([]);
    setIsSearchingUser(false);
  };

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
    <>
      <ChatSidebarComponent
        chats={chats}
        onChatSelect={handleChatSelect}
        onSearch={handleSearch}
        searchUserQuery={searchUserQuery}
        setSearchUserQuery={setSearchUserQuery}
        isSearchingUser={isSearchingUser}
        setIsSearchingUser={setIsSearchingUser}
        searchResults={searchResults}
        onUserSelect={handleUserSelect}
      />
      {isSearchingUser && (
        <div className="fixed inset-0 z-40" onClick={() => setIsSearchingUser(false)}>
          <SearchUsers onUserSelect={handleUserSelect} onClose={() => setIsSearchingUser(false)} />
        </div>
      )}
    </>
  );
}
