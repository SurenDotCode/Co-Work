import { NextRequest, NextResponse } from 'next/server';
import { submitDeliverable } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { taskId, memberId, fileName, fileSize, fileType, notes } = body;

    if (!taskId || !memberId || !fileName) {
      return NextResponse.json(
        { success: false, error: 'taskId, memberId, and fileName are required.' },
        { status: 400 }
      );
    }

    const result = submitDeliverable({
      code,
      taskId,
      memberId,
      fileName,
      fileSize,
      fileType,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: result.submission,
      room: result.room,
      message: 'File submitted successfully!',
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
