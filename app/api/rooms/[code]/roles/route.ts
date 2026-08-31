import { NextRequest, NextResponse } from 'next/server';
import { updateMemberRole } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { targetMemberId, newRole, actorId } = body;

    if (!targetMemberId || !newRole || !actorId) {
      return NextResponse.json(
        { success: false, error: 'targetMemberId, newRole, and actorId are required.' },
        { status: 400 }
      );
    }

    const result = updateMemberRole({
      code,
      targetMemberId,
      newRole,
      actorId,
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
