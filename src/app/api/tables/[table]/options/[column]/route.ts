import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Get options for a specific table column
export async function GET(
  request: Request,
  { params }: { params: { table: string; column: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const options = await prisma.fieldOptions.findMany({
      where: {
        tableName: params.table,
        columnName: params.column,
      },
      include: {
        option: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(
      options.map(fo => ({
        id: fo.option.id,
        label: fo.option.label,
        value: fo.option.value,
        color: fo.option.color,
      }))
    );
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  }
}

// Create or update options for a specific table column
export async function POST(
  request: Request,
  { params }: { params: { table: string; column: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { options } = await request.json();

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing field options for this table/column
      await tx.fieldOptions.deleteMany({
        where: {
          tableName: params.table,
          columnName: params.column,
        },
      });

      // Create new options and field options
      for (const [index, option] of options.entries()) {
        let optionRecord;
        const optionData = {
          label: option.label,
          value: option.value || option.label,
          color: option.color || null, // Ensure color is included
        };
        
        if (option.id > 0) {
          // Update existing option
          optionRecord = await tx.option.update({
            where: { id: option.id },
            data: optionData,
          });
        } else {
          // Create new option
          optionRecord = await tx.option.create({
            data: optionData,
          });
        }

        // Create field option
        await tx.fieldOptions.create({
          data: {
            tableName: params.table,
            columnName: params.column,
            optionId: optionRecord.id,
            sortOrder: index,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving options:', error);
    return NextResponse.json(
      { error: 'Failed to save options' },
      { status: 500 }
    );
  }
}

// Delete a specific option
export async function DELETE(
  request: Request,
  { params }: { params: { table: string; column: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { optionId } = await request.json();

    // Delete the field options first (due to foreign key constraint)
    await prisma.fieldOptions.deleteMany({
      where: { optionId },
    });

    // Then delete the option
    await prisma.option.delete({
      where: { id: optionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting option:', error);
    return NextResponse.json(
      { error: 'Failed to delete option' },
      { status: 500 }
    );
  }
} 