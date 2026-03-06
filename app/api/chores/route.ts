import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const chores = db.prepare(`
      SELECT c.*, m.name as member_name, m.color as member_color
      FROM chores c
      LEFT JOIN members m ON c.member_id = m.id
      ORDER BY c.created_at ASC
    `).all();
    return NextResponse.json(chores);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, frequency, member_id, points } = await request.json();
    if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const defaultPoints = frequency === 'daily' ? 5 : frequency === 'weekly' ? 10 : 20;
    const db = getDb();
    const result = db.prepare(
      'INSERT INTO chores (title, frequency, member_id, points) VALUES (?, ?, ?, ?)'
    ).run(title.trim(), frequency || 'daily', member_id || null, points ?? defaultPoints);
    const chore = db.prepare(`
      SELECT c.*, m.name as member_name, m.color as member_color
      FROM chores c LEFT JOIN members m ON c.member_id = m.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);
    return NextResponse.json(chore, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
