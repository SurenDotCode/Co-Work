import { NextRequest, NextResponse } from 'next/server';
import { joinRoom } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { name, roleTitle, department, empId, avatar } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please enter your name to join the room.' },
        { status: 400 }
      );
    }

    const memberRoleTitle = roleTitle?.trim() || department?.trim() || 'Team Member';

    const result = joinRoom({
      code,
      name: name.trim(),
      department: memberRoleTitle,
      empId,
      avatar,
    });

    if ('error' in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      room: result.room,
      member: result.member,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
