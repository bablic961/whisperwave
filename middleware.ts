// middleware.ts - Auth middleware for API routes
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAccessTokenFromCookie } from './lib/auth';
import { prisma } from './lib/prisma';

export async function middleware(request: NextRequest) {
  const token = await getAccessTokenFromCookie();

  if (!token) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
      { status: 401 }
    );
  }

  // Add user info to request headers for API routes to use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-ID', decoded.userId);
  requestHeaders.set('X-User-Email', decoded.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/(.*)'],
};
