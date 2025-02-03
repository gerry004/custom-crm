import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const finances = await prisma.finance.findMany({
      where: {
        userId: user.id // Only fetch finances for the current user
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(finances || []);
    
  } catch (error) {
    console.error('Error fetching finances:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch finances',
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
    
    // Convert amount to float
    if (data.amount) {
      data.amount = parseFloat(data.amount);
      
      // Validate that amount is a valid number
      if (isNaN(data.amount)) {
        return NextResponse.json(
          { error: 'Amount must be a valid number' },
          { status: 400 }
        );
      }
    }
    
    // Handle date fields
    if (data.date) {
      data.date = new Date(data.date);
    }
    
    const finance = await prisma.finance.create({
      data: {
        ...data,
        userId: user.id // Associate the finance with the current user
      }
    });
    
    return NextResponse.json(finance);
  } catch (error) {
    console.error('Error creating finance record:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create finance record',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 