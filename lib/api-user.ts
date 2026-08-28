// lib/api-user.ts - Helper to get current user from request
import { headers } from 'next/headers';
import { getAccessTokenFromCookie } from './auth';
import { prisma } from './prisma';

export async function getCurrentUser() {
  // Try to get token from Authorization header first
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookies
    token = await getAccessTokenFromCookie();
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        status: true,
        customStatus: true,
        role: true,
        isVerified: true,
        isOnline: true,
        lastSeen: true,
        lastActive: true,
        theme: true,
        locale: true,
        timezone: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

function verifyToken(token: string) {
  const { verify } = require('jsonwebtoken');
  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    return decoded as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}
