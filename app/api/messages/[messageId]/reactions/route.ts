// app/api/messages/[messageId]/reactions/route.ts - Message reactions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    const body = await request.json();
    const { type } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Check if reaction already exists
    const existingReaction = await prisma.reaction.findFirst({
      where: { messageId, userId, type },
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
        userId,
        type,
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

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    const reaction = await prisma.reaction.delete({
      where: {
        messageId_userId_type: { messageId, userId, type },
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
