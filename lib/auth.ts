// lib/auth.ts - JWT Utilities
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';

export const JWT_SECRET = env.JWT_SECRET;
export const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
export const REFRESH_TOKEN_EXPIRES_IN = env.REFRESH_TOKEN_EXPIRES_IN;

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(userId: string, email: string, role: string = 'USER'): Tokens {
  const accessToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function setAccessTokenInCookie(response: NextResponse, token: string): void {
  response.cookies.set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function setRefreshTokenInCookie(response: NextResponse, token: string): void {
  response.cookies.set('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60,
    path: '/api/auth/refresh',
  });
}

export function clearTokensFromCookie(response: NextResponse): void {
  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');
}

export async function getAccessTokenFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get('accessToken')?.value || null;
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const cookieStore = cookies();
  return cookieStore.get('refreshToken')?.value || null;
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt.hash()
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}
