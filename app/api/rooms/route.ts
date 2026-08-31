import { NextRequest, NextResponse } from 'next/server';
import { createRoom, listPublicRooms } from '@/lib/store';

export async function GET() {
  const rooms = listPublicRooms();
  return NextResponse.json({ success: true, rooms });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, department, hostName, customCode, plantLocation } = body;

    if (!name || !hostName) {
      return NextResponse.json(
        { success: false, error: 'Room Name and Host Name are required.' },
        { status: 400 }
      );
    }

    const { room, hostMember } = createRoom({
      name,
      department: department || 'Engineering Department',
      hostName,
      customCode,
      plantLocation,
    });

    return NextResponse.json({
      success: true,
      room,
      hostMember,
      message: `Room "${room.name}" created with code ${room.code}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
