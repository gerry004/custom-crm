import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // If we get no tasks, return an empty array but with 200 status
    return NextResponse.json(tasks || []);
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch tasks',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    // Always disconnect after the operation
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Ensure dueDate is properly formatted as a Date
    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }

    // Set default values if not provided
    const taskData = {
      ...data,
      status: data.status || 'Pending',
      priority: data.priority || 'Medium',
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