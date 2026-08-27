// components/chat/EmojiPicker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const emojis = [
  '👍', '❤️', '😂', '🎉', '😍', '😢', '😡', '💯', '🔥', '✨',
  '🙏', '😎', '😭', '👻', '👽', '🤖', '💩', '💀', '🤡', '👹',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍',
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredEmojis = search
    ? emojis.filter((e) => e.toLowerCase().includes(search.toLowerCase()))
    : emojis;

  return createPortal(
    <div
      ref={pickerRef}
      className="absolute bottom-20 right-4 z-30 w-72 rounded-xl border border-white/10 bg-[#1A1F3D] p-3 shadow-2xl"
    >
      <input
        type="text"
        placeholder="Поиск эмодзи..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-[#718096] focus:outline-none focus:ring-2 focus:ring-[#00D4FF]"
      />
      <div className="mt-3 grid grid-cols-10 gap-2 max-h-60 overflow-y-auto">
        {filteredEmojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-[#00D4FF]/10 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}
