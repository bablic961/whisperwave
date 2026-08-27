// components/chat/MessageList.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

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

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  type: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
  replyToId?: string;
  status: string;
  reactionCount: number;
  pinnedAt?: string;
  createdAt: string;
  editedAt?: string;
}

interface MessageListProps {
  chatId: string;
  typingUsers: string[];
  onSendMessage: (content: string) => void;
  onUpload: (file: File) => void;
  onReaction: (messageId: string, reaction: string) => void;
}

export function MessageList({
  chatId,
  typingUsers,
  onSendMessage,
  onUpload,
  onReaction,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00D4FF]/30 border-t-[#00D4FF]" />
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-[#A0AEC0]">
          <p>Начните чат первым сообщением!</p>
        </div>
      )}

      {messages.map((message, index) => {
        const isOwnMessage = message.senderId === 'current-user-id';
        const showSender = index === 0 || messages[index - 1].senderId !== message.senderId;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={isOwnMessage}
            showSender={showSender}
            onReaction={onReaction}
          />
        );
      })}

      {typingUsers.length > 0 && (
        <TypingIndicator userIds={typingUsers} />
      )}

      <div className="h-4" />
    </div>
  );
}
