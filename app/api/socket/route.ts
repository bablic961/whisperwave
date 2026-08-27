// app/api/socket/route.ts - WebSocket endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getSocketIO } from '@/lib/socket';
import { createServer } from 'http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') !== 'websocket') {
    return NextResponse.json({ error: 'Expected WebSocket' }, { status: 426 });
  }

  // Get or create socket.io server
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSocket server is running');
  });

  const { io } = await import('@/lib/socket');
  const socketIO = getSocketIO(server);

  return NextResponse.json({
    success: true,
    message: 'WebSocket server initialized',
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
