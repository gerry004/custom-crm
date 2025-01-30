import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { fromId, toId } = await request.json();

    // Get the current order of all leads
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Find the indices
    const fromIndex = leads.findIndex(l => l.id === fromId);
    const toIndex = leads.findIndex(l => l.id === toId);

    // Update the timestamps to reorder
    const movedLead = leads[fromIndex];
    const targetLead = leads[toIndex];

    // Update the timestamps to achieve the desired order
    await prisma.lead.update({
      where: { id: fromId },
      data: { createdAt: targetLead.createdAt }
    });

    await prisma.lead.update({
      where: { id: toId },
      data: { createdAt: movedLead.createdAt }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering leads:', error);
    return NextResponse.json(
      { error: 'Failed to reorder leads' },
      { status: 500 }
    );
  }
} 