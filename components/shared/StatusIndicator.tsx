// components/shared/StatusIndicator.tsx
import { UserStatus } from '@prisma/client';

interface StatusIndicatorProps {
  status: UserStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showOnlineText?: boolean;
  className?: string;
}

const statusColors = {
  ONLINE: 'bg-[#10B981]',
  OFFLINE: 'bg-[#718096]',
  AWAY: 'bg-[#F59E0B]',
  DO_NOT_DISTURB: 'bg-[#EF4444]',
  INVISIBLE: 'bg-[#6B7280]',
};

const statusLabels = {
  ONLINE: 'В сети',
  OFFLINE: 'Не в сети',
  AWAY: 'Отсутствует',
  DO_NOT_DISTURB: 'Не беспокоить',
  INVISIBLE: 'Невидимый',
};

export function StatusIndicator({
  status,
  size = 'md',
  showOnlineText = true,
  className = '',
}: StatusIndicatorProps) {
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.OFFLINE;

  const sizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const isOnline = status === 'ONLINE';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} ${colorClass} rounded-full`} />
        {isOnline && (
          <span className="absolute -inset-1 rounded-full bg-[#10B981]/30 animate-ping" />
        )}
      </div>
      {showOnlineText && (
        <span className="text-sm text-[#A0AEC0]">
          {statusLabels[status as keyof typeof statusLabels] || status}
        </span>
      )}
    </div>
  );
}
