/**
 * Root Layout
 * 
 * Includes analytics initialization
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnalyticsInitializer } from '@/components/analytics/AnalyticsInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "What's For Dinner - AI-Powered Meal Planning",
  description: 'Never wonder what\'s for dinner again. Get personalized meal suggestions in seconds.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnalyticsInitializer />
        {children}
      </body>
    </html>
  );
}
