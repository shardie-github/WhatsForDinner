import { NextResponse } from 'next/server';

/**
 * Dynamic robots.txt that disallows indexing in preview environments
 */
export const runtime = 'edge';

export async function GET() {
  const isPreview =
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_URL?.includes('-git-') ||
    process.env.VERCEL_URL?.includes('-vercel.app');

  if (isPreview) {
    return new NextResponse(
      `User-agent: *
Disallow: /

# Preview environment - indexing disabled`,
      {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  // Production robots.txt
  return new NextResponse(
    `User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
