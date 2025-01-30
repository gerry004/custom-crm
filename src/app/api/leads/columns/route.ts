import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // First, find out what tables exist in our database
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `;

    // Get the correct lead table name
    const leadTable = tables
      .map(t => t.tablename)
      .find(name => name.toLowerCase().includes('lead'));

    if (!leadTable) {
      return NextResponse.json(
        { error: 'Lead table not found' },
        { status: 404 }
      );
    }

    // Get the columns from the correct table, excluding automatic timestamp fields
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${leadTable}
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