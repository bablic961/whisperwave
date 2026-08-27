// app/api/chats/[chatId]/route.ts - Chat details
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const body = await request.json();
    const { name, description, avatar, coverImage, settings } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Check permissions
    const userMember = await prisma.chatMember.findFirst({
      where: { chatId, userId, role: { in: ['owner', 'admin'] } },
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
        name,
        description,
        avatar,
        coverImage,
        slowMode: settings?.slowMode,
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

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Check permissions
    const userMember = await prisma.chatMember.findFirst({
      where: { chatId, userId, role: 'owner' },
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
