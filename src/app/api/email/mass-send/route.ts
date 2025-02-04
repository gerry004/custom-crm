import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const from = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const attachments = formData.getAll('attachments') as File[];

    // Get all leads for the user
    const leads = await prisma.lead.findMany({
      where: {
        userId: user.id
      },
      select: {
        email: true
      }
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      secure: true,
      tls: {
        rejectUnauthorized: false
      }
    });

    const processedAttachments = await Promise.all(
      attachments.map(async (file: File) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    );

    // Send email to all leads
    await Promise.all(
      leads.map(lead => 
        transporter.sendMail({
          from,
          to: lead.email,
          subject,
          text: body,
          attachments: processedAttachments,
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending mass email:', error);
    return NextResponse.json(
      { error: 'Failed to send mass email' },
      { status: 500 }
    );
  }
} 