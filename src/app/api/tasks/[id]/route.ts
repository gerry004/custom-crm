import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    await prisma.task.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const id = parseInt(params.id);

    // Handle date fields
    if (data.dueDate) {
      const date = new Date(data.dueDate);
      date.setUTCHours(0, 0, 0, 0);
      data.dueDate = date;
    }

    if (data.updatedAt) {
      const date = new Date(data.updatedAt);
      date.setUTCHours(0, 0, 0, 0);
      data.updatedAt = date;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update task',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 