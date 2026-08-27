// app/contacts/page.tsx - Contacts page
import { UserCard } from '@/components/shared/UserCard';

interface User {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  status: string;
  lastSeen: string;
  isOnline?: boolean;
}

export default function ContactsPage() {
  const contacts: User[] = [
    {
      id: 'user1',
      username: 'Иван Петров',
      avatar: '/avatars/ivan.jpg',
      bio: 'Frontend разработчик',
      status: 'ONLINE',
      lastSeen: '2024-01-01T10:00:00Z',
      isOnline: true,
    },
    {
      id: 'user2',
      username: 'Мария Иванова',
      avatar: '/avatars/maria.jpg',
      bio: 'Designer',
      status: 'AWAY',
      lastSeen: '2024-01-01T09:00:00Z',
    },
    {
      id: 'user3',
      username: 'Алексей Сидоров',
      avatar: '/avatars/alexey.jpg',
      bio: 'Backend engineer',
      status: 'DO_NOT_DISTURB',
      lastSeen: '2024-01-01T08:30:00Z',
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-[#0A0E27]">
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="text-2xl font-bold text-white">Контакты</h1>
        <p className="text-[#A0AEC0]">Ваши друзья и коллеги</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Все контакты ({contacts.length})</h2>
          <div className="space-y-3">
            {contacts.map((user) => (
              <UserCard key={user.id} user={user} showAction actionLabel="Написать" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
