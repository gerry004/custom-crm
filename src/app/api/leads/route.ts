import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const leads = await prisma.lead.findMany({
      where: {
        userId: user.id // Only fetch leads for the current user
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(leads || []);
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch leads',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const leadData = {
      ...data,
      status: data.status || 'New',
      userId: user.id // Associate the lead with the current user
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