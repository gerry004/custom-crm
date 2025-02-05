import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getTableName, getPrismaModel, processData } from '@/lib/tableUtils';

export async function GET(
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

    const model = getPrismaModel(prisma, tableName);
    const items = await model.findMany({
      where: {
        userId: user.id
      }
    });

    return NextResponse.json(items || []);
  } catch (error) {
    console.error(`Error fetching ${params.table}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: `Failed to fetch ${params.table}`,
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

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

    const data = await request.json();
    const processedData = processData(data, tableName);

    const model = getPrismaModel(prisma, tableName);
    const item = await model.create({
      data: {
        ...processedData,
        userId: user.id
      }
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error(`Error creating ${params.table}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: `Failed to create ${params.table}`,
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 