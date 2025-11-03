import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('nomad_session');

  // Protect /app routes
  if (request.nextUrl.pathname.startsWith('/app') && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
