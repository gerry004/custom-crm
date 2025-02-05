import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getTableName } from '@/lib/tableUtils';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { table: string } }
) {
  try {
    const tableName = getTableName(params.table);
    if (!tableName) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;

    const dbTable = tables
      .map(t => t.tablename)
      .find(name => name.toLowerCase().includes(tableName.slice(0, -1)));

    if (!dbTable) {
      return NextResponse.json(
        { error: `${tableName} table not found` },
        { status: 404 }
      );
    }

    // Get column information including data types
    const columns = await prisma.$queryRaw<Array<{ 
      column_name: string;
      data_type: string;
      udt_name: string;
    }>>`
      SELECT 
        column_name,
        data_type,
        udt_name
      FROM information_schema.columns 
      WHERE table_name = ${dbTable}
      AND column_name NOT IN ('id')
      ORDER BY ordinal_position;
    `;

    return NextResponse.json(columns);
  } catch (error) {
    console.error(`Error fetching ${params.table} columns:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch columns' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 