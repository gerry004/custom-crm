import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    await prisma.user.count();
    return NextResponse.json({ status: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 