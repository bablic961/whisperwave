// app/api/users/block/route.ts - Block/unblock users
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reason } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const blockerId = 'current-user-id';

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'MISSING_USER_ID', message: 'Не указан ID пользователя' } },
        { status: 400 }
      );
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findFirst({
      where: { blockerId: blockerId || '', blockedId: userId || '' },
    });

    if (existingBlock) {
      return NextResponse.json(
        { error: { code: 'ALREADY_BLOCKED', message: 'Пользователь уже заблокирован' } },
        { status: 409 }
      );
    }

    const block = await prisma.blockedUser.create({
      data: {
        blockerId: blockerId || '',
        blockedId: userId || '',
        reason: reason || undefined,
      },
    });

    return NextResponse.json({ block });
  } catch (error) {
    console.error('Block user error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const blockerId = 'current-user-id';

    if (!userId) {
      return NextResponse.json(
        { error: { code: 'MISSING_USER_ID', message: 'Не указан ID пользователя' } },
        { status: 400 }
      );
    }

    await prisma.blockedUser.deleteMany({
      where: { blockerId: blockerId || '', blockedId: userId || '' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unblock user error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const blockerId = 'current-user-id';

    const blockedUsers = await prisma.blockedUser.findMany({
      where: { blockerId: blockerId || '' },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    return NextResponse.json({
      blockedUsers: blockedUsers.map((b) => ({
        ...b,
        user: b.blocked,
      })),
    });
  } catch (error) {
    console.error('Get blocked users error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
