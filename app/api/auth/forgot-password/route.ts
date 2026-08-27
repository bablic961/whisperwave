// api/auth/forgot-password/route.ts - Forgot Password
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInviteCode } from '@/lib/utils/string';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: { code: 'MISSING_EMAIL', message: 'Email не указан' } },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({
        success: true,
        message: 'Если такой email существует, мы отправили инструкции',
      });
    }

    // Generate reset token
    const resetToken = generateInviteCode(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lockedUntil: expiresAt, // Reusing lockedUntil field temporarily
      },
    });

    // Send reset email (placeholder)
    console.log(`[EMAIL] Send reset link to ${email}: /reset-password?token=${resetToken}`);

    // In production, send actual email using nodemailer
    try {
      const { createTransport } = await import('nodemailer');
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'WhisperWave'}" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: 'Сброс пароля - WhisperWave',
        html: `
          <h2>Сброс пароля</h2>
          <p>Вы запросили сброс пароля для ${email}</p>
          <p>Перейдите по ссылке для установки нового пароля:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL_PROD}/reset-password?token=${resetToken}">Сбросить пароль</a>
          <p>Ссылка действует 1 час.</p>
          <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Continue - don't fail if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Если такой email существует, мы отправили инструкции',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
