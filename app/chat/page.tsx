// app/chat/page.tsx - Chat list page
import { ChatSidebar } from '@/components/chat/ChatSidebar';

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
  lastMessageAt: string;
}

export default function ChatListPage() {
  // Mock data - in production, fetch from API
  const chats: Chat[] = [
    {
      id: 'chat1',
      type: 'DIRECT',
      name: 'Иван Петров',
      lastMessage: { content: 'Привет! Как дела?', senderId: 'user2', createdAt: '2024-01-01T10:00:00Z' },
      unreadCount: 2,
      membersCount: 2,
      lastMessageAt: '2024-01-01T10:00:00Z',
      isOnline: true,
    },
    {
      id: 'chat2',
      type: 'GROUP',
      name: 'Разработчики',
      lastMessage: { content: 'Кто может проверить PR?', senderId: 'user3', createdAt: '2024-01-01T09:30:00Z' },
      unreadCount: 0,
      membersCount: 5,
      lastMessageAt: '2024-01-01T09:30:00Z',
    },
    {
      id: 'chat3',
      type: 'DIRECT',
      name: 'Мария Иванова',
      lastMessage: { content: 'Спасибо за помощь!', senderId: 'user4', createdAt: '2024-01-01T08:15:00Z' },
      unreadCount: 0,
      membersCount: 2,
      lastMessageAt: '2024-01-01T08:15:00Z',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar chats={chats} />
    </div>
  );
}
