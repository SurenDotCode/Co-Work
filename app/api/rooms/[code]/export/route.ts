import { NextRequest, NextResponse } from 'next/server';
import { getRoom } from '@/lib/store';

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

  // Generate consolidated report matrix
  const matrix = room.members.map((member) => {
    const memberTasks = room.tasks.map((task) => {
      const isAssigned = task.assignedTo === 'ALL' || (Array.isArray(task.assignedTo) && task.assignedTo.includes(member.id));
      const submission = task.submissions[member.id];
      return {
        taskId: task.id,
        taskTitle: task.title,
        isAssigned,
        status: !isAssigned ? 'NOT_ASSIGNED' : submission ? 'SUBMITTED' : 'PENDING',
        fileName: submission?.fileName || null,
        uploadedAt: submission?.uploadedAt || null,
        fileSize: submission?.fileSize || null,
      };
    });

    const totalAssigned = memberTasks.filter((t) => t.isAssigned).length;
    const totalSubmitted = memberTasks.filter((t) => t.status === 'SUBMITTED').length;
    const complianceRate = totalAssigned > 0 ? Math.round((totalSubmitted / totalAssigned) * 100) : 100;

    return {
      memberId: member.id,
      name: member.name,
      role: member.role,
      department: member.department,
      empId: member.empId || 'N/A',
      totalAssigned,
      totalSubmitted,
      complianceRate: `${complianceRate}%`,
      tasks: memberTasks,
    };
  });

  return NextResponse.json({
    success: true,
    roomName: room.name,
    roomCode: room.code,
    department: room.department,
    generatedAt: new Date().toISOString(),
    host: room.hostName,
    summary: {
      totalMembers: room.members.length,
      totalDeadlines: room.tasks.length,
      totalSubmissions: room.tasks.reduce((acc, t) => acc + Object.keys(t.submissions).length, 0),
    },
    matrix,
  });
}
