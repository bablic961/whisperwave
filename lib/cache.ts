// lib/cache.ts - Caching Strategies
import { Redis } from 'ioredis';

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  return redis;
}

export async function cacheUser(userId: string, userData: any): Promise<void> {
  const redis = getRedisClient();
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));
}

export async function getCachedUser(userId: string): Promise<any | null> {
  const redis = getRedisClient();
  const data = await redis.get(`user:${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function invalidateUserCache(userId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(`user:${userId}`, `user:${userId}:contacts`);
}

export async function cacheChatList(userId: string, chats: any[]): Promise<void> {
  const redis = getRedisClient();
  await redis.setex(`user:${userId}:chats`, 300, JSON.stringify(chats));
}

export async function getCachedChatList(userId: string): Promise<any[] | null> {
  const redis = getRedisClient();
  const data = await redis.get(`user:${userId}:chats`);
  return data ? JSON.parse(data) : null;
}

export async function invalidateChatListCache(userId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(`user:${userId}:chats`);
}

export async function cacheMessage(message: any): Promise<void> {
  const redis = getRedisClient();
  await redis.setex(`message:${message.id}`, 86400, JSON.stringify(message));
}

export async function getCachedMessage(messageId: string): Promise<any | null> {
  const redis = getRedisClient();
  const data = await redis.get(`message:${messageId}`);
  return data ? JSON.parse(data) : null;
}

export async function cacheOnlineUsers(chatId: string, userIds: string[]): Promise<void> {
  const redis = getRedisClient();
  await redis.sadd(`chat:${chatId}:online`, ...userIds);
  await redis.expire(`chat:${chatId}:online`, 300);
}

export async function getOnlineUsers(chatId: string): Promise<string[]> {
  const redis = getRedisClient();
  return await redis.smembers(`chat:${chatId}:online`);
}

export async function removeFromOnline(chatId: string, userId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.srem(`chat:${chatId}:online`, userId);
}

// In-memory cache fallback for development
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

export function setCache(key: string, data: any, ttlSeconds: number = 300): void {
  memoryCache.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function getCache<T = any>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function deleteCache(key: string): void {
  memoryCache.delete(key);
}

export function clearCache(): void {
  memoryCache.clear();
}
