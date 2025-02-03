import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;
    
    // Verify the finance record belongs to the user
    const finance = await prisma.finance.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!finance || finance.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    await prisma.finance.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting finance record:', error);
    return NextResponse.json(
      { error: 'Failed to delete finance record' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const id = params.id;

    // Verify the finance record belongs to the user
    const finance = await prisma.finance.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!finance || finance.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Convert amount to float if it exists in the update data
    if (data.amount !== undefined) {
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

    const updatedFinance = await prisma.finance.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedFinance);
  } catch (error) {
    console.error('Error updating finance record:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to update finance record',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 