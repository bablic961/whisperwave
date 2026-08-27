// app/api/socket/route.ts - WebSocket endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getIO } from '@/lib/socket';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return NextResponse.json({ error: 'Expected WebSocket' }, { status: 426 });
  }

  const io = getIO();

  return NextResponse.json({
    success: true,
    message: 'WebSocket server initialized',
    ioReady: !!io,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Handle socket events through POST fallback
    const body = await request.json();
    const { event, data } = body;

    return NextResponse.json({
      success: true,
      event,
      received: data,
    });
  } catch (error) {
    console.error('Socket endpoint error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } },
      { status: 500 }
    );
  }
}
