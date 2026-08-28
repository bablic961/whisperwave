// app/api/messages/[messageId]/reactions/route.ts - Message reactions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

const VALID_REACTION_TYPES = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY', 'CELEBRATE', 'THINKING', 'CRYING', 'CLAPPING'];

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

    const body = await request.json();
    const { type } = body;

    if (!type || !VALID_REACTION_TYPES.includes(type)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REACTION_TYPE', message: 'Неверный тип реакции' } },
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

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findFirst({
      where: { messageId, userId: decoded.userId, type: type as any },
    });

    if (existingReaction) {
      return NextResponse.json(
        { error: { code: 'REACTION_EXISTS', message: 'Вы уже поставили эту реакцию' } },
        { status: 409 }
      );
    }

    const reaction = await prisma.reaction.create({
      data: {
        messageId,
        userId: decoded.userId,
        type: type as any,
      },
    });

    // Update reaction count on message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        reactionCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ reaction });
  } catch (error) {
    console.error('Add reaction error:', error);
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
    const type = searchParams.get('type');

    if (!messageId) {
      return NextResponse.json(
        { error: { code: 'MISSING_MESSAGE_ID', message: 'Не указан ID сообщения' } },
        { status: 400 }
      );
    }

    if (!type || !VALID_REACTION_TYPES.includes(type)) {
      return NextResponse.json(
        { error: { code: 'INVALID_REACTION_TYPE', message: 'Неверный тип реакции' } },
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

    const reaction = await prisma.reaction.delete({
      where: {
        messageId_userId_type: { messageId, userId: decoded.userId, type: type as any },
      },
    });

    // Update reaction count on message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        reactionCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ reaction });
  } catch (error) {
    console.error('Remove reaction error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
