import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection first
    await prisma.$connect();
    
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // If we get no leads, return an empty array but with 200 status
    return NextResponse.json(leads || []);
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    // Always disconnect after the operation
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Set default values if not provided
    const leadData = {
      ...data,
      status: data.status || 'New',
    };

    const lead = await prisma.lead.create({
      data: leadData
    });
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create lead',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 