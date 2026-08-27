// components/chat/TypingIndicator.tsx
'use client';

interface TypingIndicatorProps {
  userIds: string[];
}

export function TypingIndicator({ userIds }: TypingIndicatorProps) {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 animate-fade-in-up">
      <div className="h-2 w-2 rounded-full bg-[#00D4FF] animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="h-2 w-2 rounded-full bg-[#7C3AED] animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="h-2 w-2 rounded-full bg-[#06B6D4] animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
