// app/api/chats/direct/route.ts - Get/create direct chat
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // Try to get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = await getAccessTokenFromCookie();
    }

    if (!token) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    // Decode token to get user ID
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
        { status: 401 }
      );
    }

    // Check if direct chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          some: { userId: decoded.userId },
        },
        AND: {
          members: { some: { userId } },
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (existingChat) {
      return NextResponse.json({ chat: existingChat });
    }

    // Create new direct chat
    const chat = await prisma.chat.create({
      data: {
        type: 'DIRECT',
        lastMessageAt: new Date(),
        members: {
          create: [
            { userId: decoded.userId, role: 'member', joinedAt: new Date() },
            { userId, role: 'member', joinedAt: new Date() },
          ],
        },
      },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Create direct chat error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
