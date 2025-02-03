import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await request.json();

    // Validate the incoming data
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Process and validate each finance entry
    const validatedData = data.map(entry => {
      // Handle amount - remove commas and convert to float
      let amount = 0;
      if (entry.amount) {
        // Remove commas and any currency symbols, then parse
        const cleanAmount = String(entry.amount).replace(/[^0-9.-]/g, '');
        amount = parseFloat(cleanAmount);
        
        if (isNaN(amount)) {
          throw new Error(`Invalid amount value: ${entry.amount}`);
        }
      }

      return {
        description: String(entry.description || ''),
        amount: amount,
        type: String(entry.type || ''),
        tag: String(entry.tag || ''),
        date: entry.date ? new Date(entry.date) : new Date(),
        userId: user.id, // Add the user ID to each finance record
      };
    });

    // Use Prisma to create all records in a single transaction
    const result = await prisma.$transaction(
      validatedData.map(entry =>
        prisma.finance.create({
          data: entry
        })
      )
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in finances batch import:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to import finances',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 