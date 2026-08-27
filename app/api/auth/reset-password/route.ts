// api/auth/reset-password/route.ts - Reset Password
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: 'Необходимы токен и новый пароль' } },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { code: 'WEAK_PASSWORD', message: passwordValidation.error } },
        { status: 400 }
      );
    }

    // Find user with matching reset token
    // In production, use a dedicated reset token field
    const user = await prisma.user.findFirst({
      where: {
        id: token,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
        { status: 404 }
      );
    }

    // Check if token is expired (using lockedUntil as temp field)
    if (user.lockedUntil && user.lockedUntil < new Date()) {
      return NextResponse.json(
        { error: { code: 'TOKEN_EXPIRED', message: 'Токен истек' } },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lockedUntil: null,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate all sessions (optional security measure)
    // await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({
      success: true,
      message: 'Пароль успешно изменен',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
