const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load .env.local file
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && key.startsWith('DATABASE_URL')) {
      process.env.DATABASE_URL = valueParts.join('=').trim().replace(/^"|"$/g, '');
    }
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const setupDatabase = async () => {
  const client = await pool.connect();

  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        "phoneNumber" TEXT UNIQUE,
        avatar TEXT,
        "coverImage" TEXT,
        bio VARCHAR(500),
        status TEXT NOT NULL DEFAULT 'OFFLINE',
        "customStatus" VARCHAR(100),
        role TEXT NOT NULL DEFAULT 'USER',
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "isOnline" BOOLEAN NOT NULL DEFAULT false,
        "lastSeen" TIMESTAMP NOT NULL DEFAULT now(),
        "lastActive" TIMESTAMP NOT NULL DEFAULT now(),
        timezone TEXT NOT NULL DEFAULT 'UTC',
        locale TEXT NOT NULL DEFAULT 'ru',
        theme TEXT NOT NULL DEFAULT 'dark',
        "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
        "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
        "desktopNotifications" BOOLEAN NOT NULL DEFAULT true,
        "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
        "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
        "twoFactorSecret" TEXT,
        "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
        "lockedUntil" TIMESTAMP,
        "passwordChangedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "deviceId" TEXT UNIQUE NOT NULL,
        "deviceType" TEXT NOT NULL,
        "deviceName" TEXT NOT NULL,
        "pushToken" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "lastActive" TIMESTAMP NOT NULL DEFAULT now(),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        "refreshToken" TEXT UNIQUE NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "contactId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        nickname TEXT,
        "isFavorite" BOOLEAN NOT NULL DEFAULT false,
        "isBlocked" BOOLEAN NOT NULL DEFAULT false,
        notes TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("userId", "contactId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL DEFAULT 'DIRECT',
        name TEXT,
        description TEXT,
        avatar TEXT,
        "coverImage" TEXT,
        "inviteCode" TEXT UNIQUE,
        "isPublic" BOOLEAN NOT NULL DEFAULT false,
        "maxMembers" INTEGER NOT NULL DEFAULT 100,
        "slowMode" INTEGER,
        "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastMessageAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_members (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'member',
        nickname TEXT,
        "isMuted" BOOLEAN NOT NULL DEFAULT false,
        "unreadCount" INTEGER NOT NULL DEFAULT 0,
        "lastReadAt" TIMESTAMP,
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "leftAt" TIMESTAMP,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        permissions JSONB,
        UNIQUE ("chatId", "userId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "senderId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL DEFAULT 'TEXT',
        content TEXT NOT NULL,
        "encryptedContent" TEXT,
        "replyToId" TEXT REFERENCES messages(id) ON DELETE CASCADE,
        "forwardFromId" TEXT REFERENCES messages(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'SENT',
        "editedAt" TIMESTAMP,
        "deletedAt" TIMESTAMP,
        "deletedBy" TEXT,
        "mediaUrl" TEXT,
        "mediaType" TEXT,
        "mediaSize" INTEGER,
        "mediaName" TEXT,
        "thumbnailUrl" TEXT,
        "reactionCount" INTEGER NOT NULL DEFAULT 0,
        "pinnedAt" TIMESTAMP,
        "pinnedBy" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reactions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "messageId" TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("messageId", "userId", type)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "chatId" TEXT UNIQUE NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "creatorId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rules TEXT,
        tags TEXT[] NOT NULL DEFAULT '{}',
        category TEXT,
        "whoCanSend" TEXT NOT NULL DEFAULT 'everyone',
        "whoCanInvite" TEXT NOT NULL DEFAULT 'everyone',
        "whoCanEdit" TEXT NOT NULL DEFAULT 'admins',
        "whoCanDelete" TEXT NOT NULL DEFAULT 'admins',
        "isModerated" BOOLEAN NOT NULL DEFAULT false,
        "bannedWords" TEXT[] NOT NULL DEFAULT '{}',
        "autoModeration" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invite_links (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        code TEXT UNIQUE NOT NULL,
        "createdBy" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "expiresAt" TIMESTAMP,
        "maxUses" INTEGER,
        uses INTEGER NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        data JSONB,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS blocked_users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "blockerId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "blockedId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("blockerId", "blockedId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS muted_chats (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "mutedUntil" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("userId", "chatId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS pinned_chats (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "pinnedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("userId", "chatId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS archived_chats (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "archivedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("userId", "chatId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_folders (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_folder_chats (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "folderId" TEXT NOT NULL REFERENCES chat_folders(id) ON DELETE CASCADE,
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        "addedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("folderId", "chatId")
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "chatId" TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        mediaUrls TEXT[] NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        UNIQUE ("userId", "chatId")
      )
    `);

    // Create indexes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_phoneNumber ON users("phoneNumber")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_devices_userId ON devices("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_devices_deviceId ON devices("deviceId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_userId ON contacts("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_contactId ON contacts("contactId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chats_lastMessageAt ON chats("lastMessageAt")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_members_chatId ON chat_members("chatId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_members_userId ON chat_members("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_chatId ON messages("chatId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_senderId ON messages("senderId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reactions_messageId ON reactions("messageId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_groups_creatorId ON groups("creatorId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_invite_links_chatId ON invite_links("chatId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_invite_links_code ON invite_links(code)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_blocked_users_blockerId ON blocked_users("blockerId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_muted_chats_userId ON muted_chats("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_pinned_chats_userId ON pinned_chats("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_archived_chats_userId ON archived_chats("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_chat_folders_userId ON chat_folders("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_drafts_userId ON drafts("userId")`);

    console.log('Tables and indexes created successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

setupDatabase();
