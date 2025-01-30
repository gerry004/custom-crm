import './globals.css'
import type { Metadata } from 'next'
import React from 'react';
export const metadata: Metadata = {
  title: 'CRM System',
  description: 'Customer Relationship Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 