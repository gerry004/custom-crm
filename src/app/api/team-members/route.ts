import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();
    
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(teamMembers || []);
    
  } catch (error) {
    console.error('Error fetching team members:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch team members',
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
    
    const teamMember = await prisma.teamMember.create({
      data: data
    });
    
    return NextResponse.json(teamMember);
  } catch (error) {
    console.error('Error creating team member:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to create team member',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 