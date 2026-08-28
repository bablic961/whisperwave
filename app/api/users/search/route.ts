// app/api/users/search/route.ts - Search users
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: { code: 'INVALID_QUERY', message: 'Поисковый запрос слишком короткий' } },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        status: true,
        isOnline: true,
        lastSeen: true,
        bio: true,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
      },
    });

    return NextResponse.json({
      users,
      total,
      page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
