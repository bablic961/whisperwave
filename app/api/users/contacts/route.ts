// app/api/users/contacts/route.ts - Manage contacts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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

    const contacts = await prisma.contact.findMany({
      where: { userId: decoded.userId },
      include: {
        contact: {
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
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      contacts: contacts.map((c) => ({
        ...c,
        user: c.contact,
      })),
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, nickname } = body;

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

    // Check if contact already exists
    const existingContact = await prisma.contact.findFirst({
      where: { userId: decoded.userId, contactId: userId },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: { code: 'CONTACT_EXISTS', message: 'Контакт уже добавлен' } },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        userId: decoded.userId,
        contactId: userId,
        nickname,
      },
    });

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Add contact error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
