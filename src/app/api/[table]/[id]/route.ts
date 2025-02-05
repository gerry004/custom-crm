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

    const modelMap = {
      tasks: 'task',
      leads: 'lead',
      customers: 'customer',
      finances: 'finance'
    } as const;
    
    const modelName = modelMap[params.table as keyof typeof modelMap];
    if (!modelName) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const model = prisma[modelName];

    // Verify the item belongs to the user
    const item = await model.findFirst({
      where: {
        id: params.table === 'finances' ? params.id : parseInt(params.id),
        userId: user.id
      }
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await model.delete({
      where: {
        id: params.table === 'finances' ? params.id : parseInt(params.id)
      }
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

    let data = await request.json();
    
    // Process data based on table and field types
    if (params.table === 'finances') {
      // Handle amount field
      if ('amount' in data) {
        data.amount = parseFloat(data.amount);
      }
      
      // Handle date field
      if ('date' in data) {
        // If empty string or invalid date, set to null
        data.date = data.date ? new Date(data.date).toISOString() : null;
      }
    }

    const modelMap = {
      tasks: 'task',
      leads: 'lead',
      customers: 'customer',
      finances: 'finance'
    } as const;
    
    const modelName = modelMap[params.table as keyof typeof modelMap];
    if (!modelName) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const model = prisma[modelName];

    // Verify the item exists and belongs to the user before updating
    const existingItem = await model.findFirst({
      where: {
        id: params.table === 'finances' ? params.id : parseInt(params.id),
        userId: user.id
      }
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updated = await model.update({
      where: { 
        id: params.table === 'finances' ? params.id : parseInt(params.id),
        userId: user.id 
      },
      data
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
} 