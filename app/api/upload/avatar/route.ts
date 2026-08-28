// app/api/upload/avatar/route.ts - Avatar upload
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileFromFormData, validateImage } from '@/lib/upload';
import { getAccessTokenFromCookie, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
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

    const result = await uploadFileFromFormData(request, { type: 'image', folder: 'avatars' });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      avatar: result.result.url,
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
