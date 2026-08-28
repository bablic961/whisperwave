// app/api/messages/[messageId]/pin/route.ts - Pin/unpin messages
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

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
        userId: decoded.userId,
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
        pinnedBy: decoded.userId,
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
        userId: decoded.userId,
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
