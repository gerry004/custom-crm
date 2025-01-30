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

    // Get the correct customer table name
    const customerTable = tables
      .map(t => t.tablename)
      .find(name => name.toLowerCase().includes('customer'));

    if (!customerTable) {
      return NextResponse.json(
        { error: 'Customer table not found' },
        { status: 404 }
      );
    }

    // Get the columns from the correct table
    const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = ${customerTable}
      AND column_name NOT IN ('id', 'createdAt', 'updatedAt')
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