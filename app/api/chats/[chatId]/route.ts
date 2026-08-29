// app/api/chats/[chatId]/route.ts - Chat details
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: { code: 'MISSING_CHAT_ID', message: 'Не указан ID чата' } },
        { status: 400 }
      );
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
                isOnline: true,
                lastSeen: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!chat) {
      return NextResponse.json(
        { error: { code: 'CHAT_NOT_FOUND', message: 'Чат не найден' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: { code: 'MISSING_CHAT_ID', message: 'Не указан ID чата' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, avatar, coverImage, settings } = body;

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

    // Check permissions
    const userMember = await prisma.chatMember.findFirst({
      where: { chatId, userId: decoded.userId, role: { in: ['owner', 'admin'] } },
    });

    if (!userMember) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Нет прав для редактирования' } },
        { status: 403 }
      );
    }

    const chat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        name: name || undefined,
        description: description || undefined,
        avatar: avatar || undefined,
        coverImage: coverImage || undefined,
        slowMode: settings?.slowMode || undefined,
      },
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: { code: 'MISSING_CHAT_ID', message: 'Не указан ID чата' } },
        { status: 400 }
      );
    }

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

    // Check permissions
    const userMember = await prisma.chatMember.findFirst({
      where: { chatId, userId: decoded.userId, role: 'owner' },
    });

    if (!userMember) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Только создатель может удалить чат' } },
        { status: 403 }
      );
    }

    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
