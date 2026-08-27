// lib/rate-limit.ts - Rate Limiting Utility
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export function checkRateLimit(ip: string) {
  const now = Date.now();
  const record = rateLimitStore[ip];

  if (!record || now > record.resetTime) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: record?.resetTime || now + WINDOW_MS };
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: record.resetTime };
  }

  return { allowed: true, remaining: MAX_REQUESTS - record.count, resetAt: record.resetTime };
}

export function clearRateLimit(ip: string) {
  delete rateLimitStore[ip];
}

export function clearAllRateLimits() {
  Object.keys(rateLimitStore).forEach(key => delete rateLimitStore[key]);
}

export function rateLimitMiddleware(request: NextRequest, options: { windowMs?: number; maxRequests?: number } = {}) {
  const windowMs = options.windowMs || WINDOW_MS;
  const maxRequests = options.maxRequests || MAX_REQUESTS;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             request.ip ||
             'unknown';

  const now = Date.now();
  const record = rateLimitStore[ip];

  if (!record || now > record.resetTime) {
    rateLimitStore[ip] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return NextResponse.next();
  }

  record.count++;

  if (record.count > maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
        },
      }
    );
  }

  return NextResponse.next();
}
