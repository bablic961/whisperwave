// app/api/upload/avatar/route.ts - Avatar upload
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileFromFormData, validateImage } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
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
