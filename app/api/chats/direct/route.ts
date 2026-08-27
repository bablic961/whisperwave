// app/api/chats/direct/route.ts - Get/create direct chat
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const currentUserId = 'current-user-id';

    // Check if direct chat already exists
    const existingChat = await prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        members: {
          some: { userId: currentUserId },
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
            { userId: currentUserId, role: 'member', joinedAt: new Date() },
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
