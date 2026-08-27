// components/chat/ChatFilter.tsx
'use client';

interface ChatFilterProps {
  activeFilter: 'all' | 'direct' | 'groups' | 'unread';
  onChange: (filter: ChatFilterProps['activeFilter']) => void;
}

export function ChatFilter({ activeFilter, onChange }: ChatFilterProps) {
  const filters = [
    { id: 'all', label: 'Все' },
    { id: 'direct', label: 'Личные' },
    { id: 'groups', label: 'Группы' },
    { id: 'unread', label: 'Непрочитанные' },
  ];

  return (
    <div className="flex space-x-1 overflow-x-auto px-4 pb-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === filter.id
              ? 'bg-[#00D4FF]/20 text-[#00D4FF]'
              : 'text-[#A0AEC0] hover:bg-white/5 hover:text-white'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
