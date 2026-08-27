// app/api/users/contacts/route.ts - Manage contacts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    const contacts = await prisma.contact.findMany({
      where: { userId },
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

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const currentUserId = 'current-user-id';

    // Check if contact already exists
    const existingContact = await prisma.contact.findFirst({
      where: { userId: currentUserId, contactId: userId },
    });

    if (existingContact) {
      return NextResponse.json(
        { error: { code: 'CONTACT_EXISTS', message: 'Контакт уже добавлен' } },
        { status: 409 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        userId: currentUserId,
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
