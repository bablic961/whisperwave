// api/auth/verify-email/route.ts - Email Verification
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: { code: 'MISSING_TOKEN', message: 'Токен не указан' } },
        { status: 400 }
      );
    }

    // Find user with matching verification token
    // In production, this would be a dedicated verification token
    const user = await prisma.user.findFirst({
      where: {
        // For demo, we verify based on token matching username
        OR: [
          { id: token },
          { email: token },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: { code: 'ALREADY_VERIFIED', message: 'Аккаунт уже подтвержден' } },
        { status: 400 }
      );
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email успешно подтвержден',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
