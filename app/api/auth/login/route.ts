import { NextResponse } from 'next/server';

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(request: Request) {
  const { pin } = await request.json();
  const expected = process.env.AUTH_PIN;

  if (!expected) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  if (pin !== expected) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }

  const tokenValue = await hashPin(pin);
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth_token', tokenValue, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  return response;
}
