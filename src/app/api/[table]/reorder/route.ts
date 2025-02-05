import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getTableName, getPrismaModel } from '@/lib/tableUtils';

export async function POST(
  request: Request,
  { params }: { params: { table: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tableName = getTableName(params.table);
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const { fromId, toId } = await request.json();
    const model = getPrismaModel(prisma, tableName);

    // Get the current order of all items
    const items = await model.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Find the indices
    const fromIndex = items.findIndex((item: { id: any; }) => item.id === fromId);
    const toIndex = items.findIndex((item: { id: any; }) => item.id === toId);

    if (fromIndex === -1 || toIndex === -1) {
      return NextResponse.json(
        { error: 'One or both items not found' },
        { status: 404 }
      );
    }

    // Update the timestamps to reorder
    const movedItem = items[fromIndex];
    const targetItem = items[toIndex];

    // Update the timestamps to achieve the desired order
    await model.update({
      where: { id: fromId },
      data: { createdAt: targetItem.createdAt }
    });

    await model.update({
      where: { id: toId },
      data: { createdAt: movedItem.createdAt }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error reordering ${params.table}:`, error);
    return NextResponse.json(
      { error: `Failed to reorder ${params.table}` },
      { status: 500 }
    );
  }
} 