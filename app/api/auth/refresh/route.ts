// api/auth/refresh/route.ts - Refresh Tokens
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JWT_SECRET, verifyToken, generateTokens, clearTokensFromCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, deviceId } = body;

    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
        { status: 401 }
      );
    }

    // Find session with refresh token
    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: { refreshToken },
      });
      return NextResponse.json(
        { error: { code: 'TOKEN_EXPIRED', message: 'Токен истек' } },
        { status: 401 }
      );
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } },
        { status: 404 }
      );
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email, user.role);

    // Update session
    const updatedSession = await prisma.session.update({
      where: { refreshToken },
      data: {
        token: accessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update device last active
    if (deviceId) {
      await prisma.device.update({
        where: { deviceId },
        data: {
          lastActive: new Date(),
          ipAddress: request.ip || '0.0.0.0',
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          status: user.status,
          role: user.role,
          isVerified: user.isVerified,
        },
        tokens: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      },
    });

    // Set new refresh token cookie
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
