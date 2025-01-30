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

    const taskTable = tables
      .map(t => t.tablename)
      .find(name => name.toLowerCase().includes('task'));

    if (!taskTable) {
      return NextResponse.json(
        { error: 'Task table not found' },
        { status: 404 }
      );
    }

    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${taskTable}
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