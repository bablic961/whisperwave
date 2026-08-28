// app/api/chats/[chatId]/messages/route.ts - Messages
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Check if user is in chat
    const chatMember = await prisma.chatMember.findFirst({
      where: { chatId, userId: decoded.userId },
    });

    if (!chatMember) {
      return NextResponse.json(
        { error: { code: 'NOT_MEMBER', message: 'Вы не являетесь участником этого чата' } },
        { status: 403 }
      );
    }

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: { reactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    // Reverse to get chronological order
    const messagesReversed = messages.reverse();

    const total = await prisma.message.count({
      where: { chatId },
    });

    return NextResponse.json({
      messages: messagesReversed,
      total,
      page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    const body = await request.json();
    const { content, replyToId, mediaUrl, mediaType, mediaName } = body;

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

    if (!chatId) {
      return NextResponse.json(
        { error: { code: 'MISSING_CHAT_ID', message: 'Не указан ID чата' } },
        { status: 400 }
      );
    }

    // Check if user is in chat
    const chatMember = await prisma.chatMember.findFirst({
      where: { chatId, userId: decoded.userId },
    });

    if (!chatMember) {
      return NextResponse.json(
        { error: { code: 'NOT_MEMBER', message: 'Вы не являетесь участником этого чата' } },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: decoded.userId,
        type: mediaUrl ? 'IMAGE' : 'TEXT',
        content: content || '',
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
        mediaName: mediaName || undefined,
        status: 'SENT',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat last message time
    await prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
