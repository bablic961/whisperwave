// lib/validation.ts - Zod Schemas
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  captchaToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceInfo: z.object({
    deviceId: z.string().optional(),
    deviceType: z.string().optional(),
    deviceName: z.string().optional(),
    pushToken: z.string().optional(),
  }).optional(),
  twoFactorCode: z.string().optional(),
});

export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  customStatus: z.string().max(100).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  locale: z.string().optional(),
});

export const createChatSchema = z.object({
  type: z.enum(['DIRECT', 'GROUP', 'CHANNEL', 'SUPPORT']),
  name: z.string().min(1).max(100).optional(),
  memberIds: z.array(z.string()).min(1).max(100),
  avatar: z.string().url().optional(),
  isEncrypted: z.boolean().optional(),
});

export const createMessageSchema = z.object({
  chatId: z.string(),
  content: z.string().min(1).max(10000),
  replyToId: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'DOCUMENT', 'OTHER']).optional(),
});

export const addContactSchema = z.object({
  userId: z.string(),
  nickname: z.string().max(50).optional(),
});

export const blockUserSchema = z.object({
  userId: z.string(),
  reason: z.string().max(255).optional(),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const createGroupSchema = z.object({
  chatId: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  rules: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  whoCanSend: z.enum(['everyone', 'admins', 'moderators']).optional(),
  whoCanInvite: z.enum(['everyone', 'admins']).optional(),
  whoCanEdit: z.enum(['admins', 'everyone']).optional(),
  whoCanDelete: z.enum(['admins', 'everyone']).optional(),
  isModerated: z.boolean().optional(),
});

export const uploadSchema = z.object({
  fileType: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'ARCHIVE', 'OTHER']),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().max(52428800),
  fileData: z.string().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE', 'AWAY', 'DO_NOT_DISTURB', 'INVISIBLE']),
  customStatus: z.string().max(100).optional(),
});
