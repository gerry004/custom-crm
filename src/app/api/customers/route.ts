import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(customers || []);
    
  } catch (error) {
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch customers',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Convert lastContact to Date if it exists
    if (data.lastContact) {
      data.lastContact = new Date(data.lastContact);
    }

    const customer = await prisma.customer.create({
      data: data
    });
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create customer',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 