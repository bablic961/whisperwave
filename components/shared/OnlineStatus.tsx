// components/shared/OnlineStatus.tsx
'use client';

import { useEffect, useState } from 'react';

interface OnlineStatusProps {
  userId: string;
  lastSeen: Date | string;
  isOnline?: boolean;
  showOfflineTime?: boolean;
}

export function OnlineStatus({
  userId,
  lastSeen,
  isOnline: propIsOnline,
  showOfflineTime = true,
}: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(propIsOnline || false);
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (propIsOnline !== undefined) {
      setIsOnline(propIsOnline);
      return;
    }

    // Check if user is online based on lastSeen
    const checkOnlineStatus = () => {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;

      // Consider user online if active in last 2 minutes
      setIsOnline(diffMinutes < 2);
    };

    checkOnlineStatus();
    const interval = setInterval(checkOnlineStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [lastSeen, propIsOnline]);

  useEffect(() => {
    const updateTimeAgo = () => {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);

      if (diffSeconds < 60) {
        setTimeAgo('только что');
      } else if (diffSeconds < 3600) {
        const minutes = Math.floor(diffSeconds / 60);
        setTimeAgo(`${minutes} мин. назад`);
      } else if (diffSeconds < 86400) {
        const hours = Math.floor(diffSeconds / 3600);
        setTimeAgo(`${hours} ч. назад`);
      } else {
        const days = Math.floor(diffSeconds / 86400);
        setTimeAgo(`${days} дн. назад`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [lastSeen]);

  return (
    <div className="flex items-center space-x-2">
      <span
        className={`relative flex h-3 w-3 rounded-full ${
          isOnline ? 'bg-[#10B981]' : 'bg-[#718096]'
        }`}
      >
        {isOnline && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981]/40" />
        )}
      </span>
      <span className="text-xs text-[#718096]">
        {isOnline ? 'В сети' : (showOfflineTime ? `Был(а) ${timeAgo}` : '')}
      </span>
    </div>
  );
}
