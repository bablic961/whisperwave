// app/api/upload/image/route.ts - Image upload
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileFromFormData, validateImage } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const result = await uploadFileFromFormData(request, { type: 'image', folder: 'images' });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.result.url,
      secureUrl: result.result.secureUrl,
      publicId: result.result.publicId,
      width: result.result.width,
      height: result.result.height,
      size: result.result.size,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
