// api/auth/register/route.ts - User Registration
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateTokens, validatePassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { email, username, password, phoneNumber, timezone, locale } = validation.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
          { phoneNumber },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: { code: 'EMAIL_EXISTS', message: 'Email уже зарегистрирован' } },
          { status: 409 }
        );
      }
      if (existingUser.username === username.toLowerCase()) {
        return NextResponse.json(
          { error: { code: 'USERNAME_EXISTS', message: 'Имя пользователя занято' } },
          { status: 409 }
        );
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return NextResponse.json(
          { error: { code: 'PHONE_EXISTS', message: 'Номер телефона уже зарегистрирован' } },
          { status: 409 }
        );
      }
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: { code: 'WEAK_PASSWORD', message: passwordValidation.error } },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        phoneNumber: phoneNumber || undefined,
        timezone: timezone || 'UTC',
        locale: locale || 'ru',
        status: 'OFFLINE',
        isVerified: false,
        isOnline: false,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        status: true,
        role: true,
        isVerified: true,
        createdAt: true,
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
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: request.ip || '0.0.0.0',
        userAgent: request.headers.get('user-agent') || 'Unknown',
      },
    });

    // User settings are stored directly in the User model
    // No separate settings record needed

    const response = NextResponse.json({
      success: true,
      data: {
        user,
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
