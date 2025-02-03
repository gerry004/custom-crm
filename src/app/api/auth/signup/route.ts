import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    await prisma.$connect(); // Explicitly connect to test connection

    const { name, email, password } = await request.json();
    console.log('Received signup request for:', email); // Debug log

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with better error handling
    try {
      console.log('Attempting to create user...'); // Debug log
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      console.log('User created successfully:', user.id); // Debug log

      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      const response = NextResponse.json({ success: true });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400 // 1 day
      });

      return response;
    } catch (dbError) {
      console.error('Detailed database error:', dbError); // More detailed error logging
      return NextResponse.json(
        { 
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
          stack: dbError instanceof Error ? dbError.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Detailed signup error:', error); // More detailed error logging
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 