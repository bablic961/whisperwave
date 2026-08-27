// app/api/chats/[chatId]/typing/route.ts - Typing indicator
import { NextRequest, NextResponse } from 'next/server';

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

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' } },
        { status: 401 }
      );
    }

    const userId = 'current-user-id';

    if (chatId) {
      if (typingState[chatId]) {
        if (isTyping) {
          typingState[chatId][userId] = {
            expiresAt: Date.now() + 5000, // 5 seconds
          };
        } else {
          delete typingState[chatId][userId];
        }
      } else if (isTyping) {
        typingState[chatId] = {
          [userId]: { expiresAt: Date.now() + 5000 },
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
