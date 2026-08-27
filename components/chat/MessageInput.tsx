// components/chat/MessageInput.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { EmojiPicker } from './EmojiPicker';
import { FileUploader } from './FileUploader';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onUpload: (file: File) => void;
  isTyping: boolean;
}

export function MessageInput({ onSendMessage, onUpload, isTyping }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAttached, setIsAttached] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (!content.trim()) return;

    onSendMessage(content);
    setContent('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  const handleFileUpload = (file: File) => {
    onUpload(file);
    setIsAttached(false);
  };

  return (
    <div className="relative border-t border-white/10 bg-[#1A1F3D] px-4 py-4">
      {showEmojiPicker && (
        <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
      )}

      <div className="flex items-end space-x-2">
        <FileUploader onUpload={handleFileUpload} />

        <div className="flex-1 rounded-2xl bg-[#0A0E27] border border-white/10 focus-within:border-[#00D4FF]/50 transition-colors">
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написать сообщение..."
            className="w-full max-h-32 rounded-2xl bg-transparent px-4 py-3 text-white placeholder-[#718096] focus:outline-none resize-none"
            rows={1}
          />
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="rounded-full p-2 text-[#A0AEC0] hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!content.trim()}
            className="rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] px-4 py-2 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-xs text-[#718096]">
          {isTyping ? (
            <span className="text-[#00D4FF]">Собеседник печатает...</span>
          ) : (
            <span>Нажмите Enter для отправки</span>
          )}
        </p>
      </div>
    </div>
  );
}
