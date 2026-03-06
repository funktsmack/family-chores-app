import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const members = db.prepare('SELECT * FROM members ORDER BY total_points DESC').all();
    return NextResponse.json(members);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const db = getDb();
    const result = db
      .prepare('INSERT INTO members (name, color) VALUES (?, ?)')
      .run(name.trim(), color || '#6366f1');
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(member, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
