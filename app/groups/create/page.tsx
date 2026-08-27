// app/groups/create/page.tsx - Create group page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function CreateGroupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'GROUP',
          name,
          description,
          memberIds: ['current-user-id'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/chat/${data.chat.id}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0E27] px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1F3D] p-8 shadow-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Создать группу</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Название группы</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Разработчики"
              className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#A0AEC0]">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание группы"
              className="w-full rounded-xl bg-[#0A0E27] border border-white/10 px-4 py-3 text-white placeholder-[#718096] focus:border-[#00D4FF]/50 focus:outline-none"
              rows={3}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Создать группу
          </Button>
        </form>

        <button
          onClick={() => router.back()}
          className="mt-4 w-full text-center text-sm text-[#718096] hover:text-white"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
