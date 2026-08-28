// components/chat/MessageBubble.tsx
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '../providers/AuthProvider';

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

interface MessageBubbleProps {
  message: {
    id: string;
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
    status: string;
    reactionCount: number;
    createdAt: string;
    editedAt?: string;
  };
  isOwn: boolean;
  showSender: boolean;
  onReaction: (messageId: string, reaction: string) => void;
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  onReaction,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const handleReaction = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowMenu(false);
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      {!isOwn && showSender && (
        <div className="mr-3 flex-shrink-0">
          <img
            src={message.sender.avatar || '/avatar-placeholder.png'}
            alt={message.sender.username}
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      )}

      <div className="max-w-[80%]">
        {showSender && (
          <div className="mb-1 ml-12 text-xs text-[#718096]">
            {message.sender.username}
          </div>
        )}

        <div className="relative">
          <div
            ref={menuRef}
            className={`rounded-2xl px-4 py-3 shadow-lg transition-all ${
              isOwn
                ? 'bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20 rounded-br-sm'
                : 'bg-white/10 rounded-bl-sm'
            }`}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowMenu(true);
            }}
          >
            {message.type === 'TEXT' && (
              <p className="text-[#A0AEC0]">{message.content}</p>
            )}

            {message.type === 'IMAGE' && message.mediaUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={message.mediaUrl}
                  alt={message.mediaName || 'Изображение'}
                  className="max-h-64 w-auto rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 mt-2 text-[#718096]">
              <span className="text-xs">
                {formatTimeAgo(message.createdAt)}
              </span>
              {message.status === 'READ' && (
                <span className="text-[#3B82F6]">✓✓</span>
              )}
              {message.status === 'DELIVERED' && (
                <span className="text-[#3B82F6]">✓</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwn && showSender && (
        <div className="ml-3 flex-shrink-0">
          <img
            src={user?.avatar || '/avatar-placeholder.png'}
            alt={user?.username || 'Я'}
            className="h-8 w-8 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
