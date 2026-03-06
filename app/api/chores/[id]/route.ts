import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, frequency, member_id, points } = await request.json();
    const db = getDb();
    db.prepare(
      'UPDATE chores SET title = ?, frequency = ?, member_id = ?, points = ? WHERE id = ?'
    ).run(title, frequency, member_id || null, points, id);
    const chore = db.prepare(`
      SELECT c.*, m.name as member_name, m.color as member_color
      FROM chores c LEFT JOIN members m ON c.member_id = m.id
      WHERE c.id = ?
    `).get(id);
    return NextResponse.json(chore);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare('DELETE FROM chores WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
