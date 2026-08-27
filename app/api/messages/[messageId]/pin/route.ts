// app/api/messages/[messageId]/pin/route.ts - Pin/unpin messages
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: { code: 'MISSING_MESSAGE_ID', message: 'Не указан ID сообщения' } },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Check if user is chat admin
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true },
    });

    if (!message) {
      return NextResponse.json(
        { error: { code: 'MESSAGE_NOT_FOUND', message: 'Сообщение не найдено' } },
        { status: 404 }
      );
    }

    const userMember = await prisma.chatMember.findFirst({
      where: {
        chatId: message.chatId,
        userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!userMember) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Только администраторы могут пинить сообщения' } },
        { status: 403 }
      );
    }

    const pinnedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        pinnedAt: new Date(),
        pinnedBy: userId,
      },
    });

    return NextResponse.json({ message: pinnedMessage });
  } catch (error) {
    console.error('Pin message error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json(
        { error: { code: 'MISSING_MESSAGE_ID', message: 'Не указан ID сообщения' } },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Check if user is chat admin
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { chat: true },
    });

    if (!message) {
      return NextResponse.json(
        { error: { code: 'MESSAGE_NOT_FOUND', message: 'Сообщение не найдено' } },
        { status: 404 }
      );
    }

    const userMember = await prisma.chatMember.findFirst({
      where: {
        chatId: message.chatId,
        userId,
        role: { in: ['owner', 'admin'] },
      },
    });

    if (!userMember) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Только администраторы могут отменять пин' } },
        { status: 403 }
      );
    }

    const unpinnedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        pinnedAt: null,
        pinnedBy: null,
      },
    });

    return NextResponse.json({ message: unpinnedMessage });
  } catch (error) {
    console.error('Unpin message error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
