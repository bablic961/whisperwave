# WhisperWave - Secure Messaging Platform

WhisperWave - это современный мессенджер с философией "цифрового океана". Каждое сообщение - это волна, достигающая собеседника с мгновенной доставкой.

## Features

- 🔒 Энд-кенд шифрование сообщений
- ⚡ Мгновенная доставка (< 100ms)
- 📱 Кроссплатформенность (Web + PWA)
- 👥 Личные чаты и групповые беседы
- 🎨 Океанический дизайн-система
- 🌐 Реальное время (WebSocket)
- 📤 Обмен медиа-контентом

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Query

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- Socket.io for WebSockets

### Deployment
- Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/whisperwave.git
cd whisperwave
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your configuration
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start development server
```bash
npm run dev
```

## Project Structure

```
whisperwave/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Authentication pages
│   ├── chat/            # Chat functionality
│   ├── contacts/        # Contact management
│   └── groups/          # Group management
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   ├── chat/            # Chat-specific components
│   ├── shared/          # Shared utilities
│   └── providers/       # Context providers
├── lib/                 # Shared utilities
│   ├── auth.ts          # Authentication
│   ├── prisma.ts        # Database client
│   ├── socket.ts        # WebSocket setup
│   └── utils/           # Utility functions
├── prisma/              # Database schema
└── vercel.json          # Vercel configuration
```

## API Documentation

See the API routes in `app/api/` for full documentation.

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh tokens

### Users
- `GET /api/users` - Get current user
- `PUT /api/users` - Update profile
- `GET /api/users/search` - Search users
- `POST /api/users/status` - Update status

### Chats
- `GET /api/chats` - List chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id` - Get chat details
- `POST /api/chats/:id/messages` - Send message

## Deployment

This project is configured for deployment on Vercel.

```bash
vercel
```

## License

MIT License
