import { NextRequest, NextResponse } from 'next/server';
import { getRoom, updateRoomDetails, restoreOrUpsertRoom } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json(
      { success: false, error: `Room "${code}" not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    room,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();

    // Auto-restore room if passed from client backup
    if (body.restoreRoom) {
      const restored = restoreOrUpsertRoom(body.restoreRoom);
      return NextResponse.json({
        success: true,
        room: restored,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid operation' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { actorId, name, department, plantLocation, settings } = body;

    if (!actorId) {
      return NextResponse.json(
        { success: false, error: 'Actor ID is required.' },
        { status: 400 }
      );
    }

    const result = updateRoomDetails({
      code,
      actorId,
      name,
      department,
      plantLocation,
      settings,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      room: result.room,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
