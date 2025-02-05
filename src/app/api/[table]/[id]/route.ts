import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getTableName, getPrismaModel, processData } from '@/lib/tableUtils';

export async function DELETE(
  request: Request,
  { params }: { params: { table: string; id: string } }
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

    // Convert string id to integer
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const model = getPrismaModel(prisma, tableName);

    // Verify the item belongs to the user
    const item = await model.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await model.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${params.table}:`, error);
    return NextResponse.json(
      { error: `Failed to delete ${params.table}` },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { table: string; id: string } }
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

    // Convert string id to integer
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const data = await request.json();
    const model = getPrismaModel(prisma, tableName);

    // Verify the item belongs to the user
    const item = await model.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!item || item.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const processedData = processData(data, tableName);
    const updatedItem = await model.update({
      where: { id },
      data: processedData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Error updating ${params.table}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: `Failed to update ${params.table}`,
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 