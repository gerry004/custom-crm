import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fromId, toId } = await request.json();

    // Get the current order of all customers
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Find the indices
    const fromIndex = customers.findIndex(c => c.id === fromId);
    const toIndex = customers.findIndex(c => c.id === toId);

    // Update the timestamps to reorder
    const movedCustomer = customers[fromIndex];
    const targetCustomer = customers[toIndex];

    // Update the timestamps to achieve the desired order
    await prisma.customer.update({
      where: { id: fromId },
      data: { createdAt: targetCustomer.createdAt }
    });

    await prisma.customer.update({
      where: { id: toId },
      data: { createdAt: movedCustomer.createdAt }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering customers:', error);
    return NextResponse.json(
      { error: 'Failed to reorder customers' },
      { status: 500 }
    );
  }
} 