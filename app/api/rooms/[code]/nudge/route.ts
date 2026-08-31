import { NextRequest, NextResponse } from 'next/server';
import { sendNudge } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { actorId, taskId, customMessage } = body;

    if (!actorId) {
      return NextResponse.json(
        { success: false, error: 'actorId is required.' },
        { status: 400 }
      );
    }

    const result = sendNudge({
      code,
      actorId,
      taskId,
      customMessage,
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
      countNudged: result.countNudged,
      message: `Pings sent to ${result.countNudged} team members.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
