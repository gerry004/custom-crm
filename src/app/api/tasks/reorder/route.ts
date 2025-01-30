import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fromId, toId } = await request.json();

    // Get the current order of all tasks
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Find the indices
    const fromIndex = tasks.findIndex(t => t.id === fromId);
    const toIndex = tasks.findIndex(t => t.id === toId);

    // Update the timestamps to reorder
    const movedTask = tasks[fromIndex];
    const targetTask = tasks[toIndex];

    // Update the timestamps to achieve the desired order
    await prisma.task.update({
      where: { id: fromId },
      data: { createdAt: targetTask.createdAt }
    });

    await prisma.task.update({
      where: { id: toId },
      data: { createdAt: movedTask.createdAt }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { error: 'Failed to reorder tasks' },
      { status: 500 }
    );
  }
} 