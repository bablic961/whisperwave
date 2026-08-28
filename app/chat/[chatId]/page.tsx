// app/chat/[chatId]/page.tsx - Individual chat page
'use client';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useState, useEffect } from 'react';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: { id: string; username: string; avatar?: string };
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

interface TypingUser {
  userId: string;
  username: string;
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [chatName, setChatName] = useState('');
  const [membersCount, setMembersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch messages and chat details
    const fetchChatData = async () => {
      setIsLoading(true);
      try {
        const [messagesRes, chatRes] = await Promise.all([
          fetch(`/api/chats/${params.chatId}/messages`),
          fetch(`/api/chats/${params.chatId}`),
        ]);

        if (messagesRes.ok && chatRes.ok) {
          const messagesData = await messagesRes.json();
          const chatData = await chatRes.json();

          setMessages(messagesData.messages || []);
          setChatName(chatData.chat.name || 'Чат');
          setMembersCount(chatData.chat.members?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [params.chatId]);

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch(`/api/chats/${params.chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage.message]);
      } else {
        console.error('Failed to send message:', await response.text());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      handleSendMessage(data.url);
    }
  };

  const handleReaction = (messageId: string, reaction: string) => {
    // Handle reaction logic
    console.log('Reaction:', messageId, reaction);
  };

  return (
    <div className="flex h-screen flex-col bg-[#0A0E27]">
      <ChatHeader
        chatName={chatName}
        membersCount={membersCount}
        isOnline={false}
      />

      <MessageList
        chatId={params.chatId}
        typingUsers={typingUsers.map((u) => u.userId)}
        onSendMessage={handleSendMessage}
        onUpload={handleUpload}
        onReaction={handleReaction}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        onUpload={handleUpload}
        isTyping={typingUsers.length > 0}
      />
    </div>
  );
}
