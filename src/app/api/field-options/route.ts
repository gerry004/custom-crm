import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');
    const columnName = searchParams.get('column');

    if (!tableName || !columnName) {
      return NextResponse.json(
        { error: 'Table and column names are required' },
        { status: 400 }
      );
    }

    const fieldOptions = await prisma.fieldOptions.findMany({
      where: {
        tableName,
        columnName,
      },
      include: {
        option: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const options = fieldOptions.map(fo => ({
      value: fo.option.value,
      label: fo.option.label,
      color: fo.option.color,
    }));

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error fetching field options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field options' },
      { status: 500 }
    );
  }
} 