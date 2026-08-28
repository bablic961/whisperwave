// components/chat/ChatSidebarClient.tsx
'use client';

import { useState } from 'react';
import { ChatSidebar as ChatSidebarComponent } from '@/components/chat/ChatSidebar';

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

interface ChatSidebarClientProps {
  chats: Chat[];
}

export function ChatSidebarClient({ chats }: ChatSidebarClientProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleChatSelect = (chatId: string) => {
    // Navigate to chat - using window.location for now
    // In production, use router.push(`/chat/${chatId}`)
    window.location.href = `/chat/${chatId}`;
  };

  return (
    <ChatSidebarComponent
      chats={chats}
      onChatSelect={handleChatSelect}
      onSearch={handleSearch}
    />
  );
}
