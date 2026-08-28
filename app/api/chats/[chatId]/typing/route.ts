// app/api/chats/[chatId]/typing/route.ts - Typing indicator
import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

// In-memory typing state (in production, use Redis)
interface TypingUser {
  expiresAt: number;
}
interface TypingState {
  [chatId: string]: {
    [userId: string]: TypingUser;
  };
}
const typingState: TypingState = {};

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    const body = await request.json();
    const { isTyping } = body;

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

    if (chatId) {
      if (typingState[chatId]) {
        if (isTyping) {
          typingState[chatId][decoded.userId] = {
            expiresAt: Date.now() + 5000, // 5 seconds
          };
        } else {
          delete typingState[chatId][decoded.userId];
        }
      } else if (isTyping) {
        typingState[chatId] = {
          [decoded.userId]: { expiresAt: Date.now() + 5000 },
        };
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    // Clean expired typing states
    if (chatId && typingState[chatId]) {
      const now = Date.now();
      Object.keys(typingState[chatId]).forEach((userId) => {
        if (typingState[chatId][userId].expiresAt < now) {
          delete typingState[chatId][userId];
        }
      });

      if (Object.keys(typingState[chatId]).length === 0) {
        delete typingState[chatId];
      }
    }

    return NextResponse.json({
      typingUsers: chatId ? Object.keys(typingState[chatId] || {}) : [],
    });
  } catch (error) {
    console.error('Get typing error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
