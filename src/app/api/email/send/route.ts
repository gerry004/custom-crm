import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const to = formData.get('to') as string;
    const from = formData.get('from') as string;
    const subject = formData.get('subject') as string;
    const body = formData.get('body') as string;
    const attachments = formData.getAll('attachments') as File[];

    // Create Nodemailer transporter
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

    // Convert attachments to format expected by nodemailer
    const processedAttachments = await Promise.all(
      attachments.map(async (file: File) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      }))
    );

    // Send email
    await transporter.sendMail({
      from,
      to,
      subject,
      text: body,
      attachments: processedAttachments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 