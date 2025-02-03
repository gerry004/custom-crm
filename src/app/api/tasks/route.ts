import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const tasks = await prisma.task.findMany({
      where: {
        userId: user.id // Only fetch tasks for the current user
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(tasks || []);
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch tasks',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Handle date fields
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    
    const taskData = {
      ...data,
      status: data.status || 'To Do',
      priority: data.priority || 'Medium',
      userId: user.id // Associate the task with the current user
    };

    const task = await prisma.task.create({
      data: taskData
    });
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create task',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 