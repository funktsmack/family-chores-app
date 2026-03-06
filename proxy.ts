import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function proxy(request: NextRequest) {
  const pin = process.env.AUTH_PIN;
  // If no PIN is configured, auth is disabled (local dev)
  if (!pin) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Always allow login page and auth API
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('auth_token')?.value;
  const expected = await hashPin(pin);

  if (authCookie === expected) return NextResponse.next();

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
