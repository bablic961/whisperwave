// api/auth/logout/route.ts - User Logout
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, allDevices = false } = body;

    // Get user from refresh token
    const session = await prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session) {
      return NextResponse.json(
        { error: { code: 'INVALID_TOKEN', message: 'Неверный токен' } },
        { status: 401 }
      );
    }

    const userId = session.userId;

    if (allDevices) {
      // Delete all sessions for user
      await prisma.session.deleteMany({
        where: { userId },
      });

      // Deactivate all devices
      await prisma.device.updateMany({
        where: { userId },
        data: { isActive: false },
      });
    } else {
      // Delete current session
      await prisma.session.delete({
        where: { refreshToken },
      });

      // Deactivate current device if provided
      if (session.userAgent) {
        await prisma.device.updateMany({
          where: {
            userId,
            userAgent: session.userAgent,
          },
          data: { isActive: false },
        });
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear cookies
    response.cookies.delete('refreshToken');
    response.cookies.delete('accessToken');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
