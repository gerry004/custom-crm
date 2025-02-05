import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getTableName, getPrismaModel } from '@/lib/tableUtils';

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

    const model = getPrismaModel(prisma, tableName);

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
    }
    
    // Handle date fields for all tables
    const dateFields = {
      finances: ['date'],
      leads: [], // leads only has createdAt/updatedAt which are handled by Prisma
      customers: ['lastContact'], // matches @map("last_contact") in schema
      tasks: ['dueDate'] // matches @map("due_date") in schema
    };

    // Get date fields for current table
    const tableDateFields = dateFields[params.table as keyof typeof dateFields] || [];
    
    // Process each date field
    tableDateFields.forEach(field => {
      if (field in data) {
        // If empty string or invalid date, set to null
        data[field] = data[field] ? new Date(data[field]).toISOString() : null;
      }
    });

    const tableName = getTableName(params.table);
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const model = getPrismaModel(prisma, tableName);

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