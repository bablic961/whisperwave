// app/api/upload/file/route.ts - File upload
import { NextRequest, NextResponse } from 'next/server';
import { uploadFileFromFormData } from '@/lib/upload';

export async function POST(request: NextRequest) {
  try {
    const result = await uploadFileFromFormData(request, { type: 'raw', folder: 'files' });

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
      size: result.result.size,
      resourceType: result.result.resourceType,
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
