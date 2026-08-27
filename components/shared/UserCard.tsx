// components/shared/UserCard.tsx
import Link from 'next/link';
import { StatusIndicator } from './StatusIndicator';
import { OnlineStatus } from './OnlineStatus';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    avatar?: string;
    bio?: string;
    status: string;
    lastSeen: Date | string;
    isOnline?: boolean;
  };
  showAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function UserCard({
  user,
  showAction = false,
  actionLabel = 'Написать',
  onAction,
  size = 'md',
}: UserCardProps) {
  const avatarUrl = user.avatar || `/api/avatar?username=${user.username}`;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const avatarSize = {
    sm: 40,
    md: 64,
    lg: 80,
  };

  return (
    <div className={`group rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all`}>
      <div className={`${sizeClasses[size]} flex items-center space-x-4`}>
        <div className="relative flex-shrink-0">
          <div className="relative overflow-hidden rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#7C3AED]/20">
            <img
              src={avatarUrl}
              alt={user.username}
              className="h-16 w-16 rounded-full object-cover"
              width={avatarSize[size]}
              height={avatarSize[size]}
            />
          </div>
          <div className="absolute bottom-0 right-0">
            <StatusIndicator
              status={user.status}
              size="sm"
              className="shadow-lg"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="truncate text-base font-semibold text-white">
              {user.username}
            </h3>
            {showAction && (
              <button
                onClick={onAction}
                className="rounded-full bg-[#00D4FF]/10 px-3 py-1 text-xs font-medium text-[#00D4FF] transition-colors hover:bg-[#00D4FF]/20"
              >
                {actionLabel}
              </button>
            )}
          </div>

          <p className="truncate text-sm text-[#A0AEC0]">{user.bio || 'Нет биографии'}</p>

          <div className="mt-2">
            <OnlineStatus userId={user.id} lastSeen={user.lastSeen} isOnline={user.isOnline} />
          </div>
        </div>
      </div>
    </div>
  );
}
