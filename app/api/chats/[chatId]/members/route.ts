// app/api/chats/[chatId]/members/route.ts - Manage chat members
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    const body = await request.json();
    const { userIds } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Check if user is admin/owner
    const userMember = await prisma.chatMember.findFirst({
      where: { chatId: chatId || '', userId: userId || '' },
    });

    if (!userMember || !['owner', 'admin'].includes(userMember.role)) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Нет прав для добавления участников' } },
        { status: 403 }
      );
    }

    const members = await prisma.chatMember.createMany({
      data: userIds.map((id: string) => ({
        chatId,
        userId: id,
        role: 'member',
        joinedAt: new Date(),
        isActive: true,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Add members error:', error);
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
    const memberId = searchParams.get('userId');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    // Can't remove owner
    if (memberId === userId) {
      return NextResponse.json(
        { error: { code: 'CANNOT_REMOVE_OWNER', message: 'Нельзя удалить себя' } },
        { status: 400 }
      );
    }

    if (!chatId || !memberId) {
      return NextResponse.json(
        { error: { code: 'MISSING_PARAMS', message: 'Отсутствуют обязательные параметры' } },
        { status: 400 }
      );
    }

    await prisma.chatMember.delete({
      where: { chatId_userId: { chatId, userId: memberId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
