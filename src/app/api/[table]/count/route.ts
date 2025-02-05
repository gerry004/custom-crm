import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getTableName, getPrismaModel } from '@/lib/tableUtils';

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
    const count = await model.count({
      where: {
        userId: user.id
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error(`Error counting ${params.table}:`, error);
    return NextResponse.json(
      { error: `Failed to count ${params.table}` },
      { status: 500 }
    );
  }
} 