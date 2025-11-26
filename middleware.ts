import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware voor dashboard wordt nu client-side afgehandeld door AuthContext
  // omdat Better Auth cookies cross-origin zijn (localhost:3000 vs localhost:3001)
  // en niet beschikbaar zijn in Next.js middleware
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
