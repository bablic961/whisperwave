// api/auth/login/route.ts - User Login
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateTokens, clearTokensFromCookie } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  deviceInfo: z.object({
    deviceId: z.string().optional(),
    deviceType: z.string().optional(),
    deviceName: z.string().optional(),
    pushToken: z.string().optional(),
  }).optional(),
  twoFactorCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email, password, deviceInfo, twoFactorCode } = validation.data;
    const emailLower = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' } },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { error: { code: 'ACCOUNT_LOCKED', message: 'Аккаунт заблокирован. Попробуйте позже' } },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      const failedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = failedAttempts >= 5;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : failedAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });

      if (shouldLock) {
        return NextResponse.json(
          { error: { code: 'ACCOUNT_LOCKED', message: 'Аккаунт заблокирован. Попробуйте позже' } },
          { status: 423 }
        );
      }

      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' } },
        { status: 401 }
      );
    }

    // Handle 2FA
    if (user.twoFactorEnabled && !twoFactorCode) {
      return NextResponse.json(
        { error: { code: '2FA_REQUIRED', message: 'Требуется двухфакторная аутентификация' } },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled && twoFactorCode) {
      // Validate 2FA code (implementation would use speakeasy)
      const is2FaValid = true; // Placeholder - implement TOTP validation
      if (!is2FaValid) {
        return NextResponse.json(
          { error: { code: 'INVALID_2FA', message: 'Неверный код 2FA' } },
          { status: 401 }
        );
      }
    }

    // Reset failed attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastActive: new Date(),
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: request.ip || '0.0.0.0',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      },
    });

    // Create or update device record
    if (deviceInfo && deviceInfo.deviceId) {
      await prisma.device.upsert({
        where: { deviceId: deviceInfo.deviceId },
        create: {
          userId: user.id,
          deviceId: deviceInfo.deviceId,
          deviceType: deviceInfo.deviceType ?? 'web',
          deviceName: deviceInfo.deviceName ?? 'Unknown device',
          pushToken: deviceInfo.pushToken ?? undefined,
          ipAddress: request.ip || '0.0.0.0',
          userAgent: request.headers.get('user-agent') || 'Unknown',
          lastActive: new Date(),
          isActive: true,
        },
        update: {
          lastActive: new Date(),
          isActive: true,
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
          bio: user.bio,
          status: user.status,
          role: user.role,
          isVerified: user.isVerified,
          isOnline: user.isOnline,
          lastSeen: user.lastSeen,
          theme: user.theme,
          locale: user.locale,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });

    // Set refresh token cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60,
      path: '/api/auth/refresh',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
