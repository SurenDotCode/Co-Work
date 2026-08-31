import { NextRequest, NextResponse } from 'next/server';
import { createTask, deleteTask } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { actorId, title, description, dueDateTime, deliverableType, priority, assignedTo } = body;

    if (!actorId || !title || !dueDateTime) {
      return NextResponse.json(
        { success: false, error: 'Title, due date, and actor ID are required.' },
        { status: 400 }
      );
    }

    const result = createTask({
      code,
      actorId,
      title,
      description: description || '',
      dueDateTime,
      deliverableType: deliverableType || 'EXCEL',
      priority: priority || 'NORMAL',
      assignedTo: assignedTo || 'ALL',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      task: result.task,
      room: result.room,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { taskId, actorId } = body;

    if (!taskId || !actorId) {
      return NextResponse.json(
        { success: false, error: 'taskId and actorId are required.' },
        { status: 400 }
      );
    }

    const result = deleteTask({ code, taskId, actorId });

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
