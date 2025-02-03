import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;

    const financeTable = tables
      .map(t => t.tablename)
      .find(name => name.toLowerCase().includes('finance'));

    if (!financeTable) {
      return NextResponse.json(
        { error: 'Finance table not found' },
        { status: 404 }
      );
    }

    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${financeTable}
      AND column_name NOT IN ('id')
      ORDER BY ordinal_position;
    `;

    const columnNames = columns.map(col => col.column_name);
    
    return NextResponse.json(columnNames);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch columns' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 