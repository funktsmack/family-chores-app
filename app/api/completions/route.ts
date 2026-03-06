import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const completions = db.prepare(`
      SELECT co.id, co.chore_id, co.member_id, co.completed_at,
             ch.title as chore_title, ch.frequency, ch.points,
             m.name as member_name, m.color as member_color
      FROM completions co
      JOIN chores ch ON co.chore_id = ch.id
      JOIN members m ON co.member_id = m.id
      ORDER BY co.completed_at DESC
      LIMIT 100
    `).all();
    return NextResponse.json(completions);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { chore_id, member_id } = await request.json();
    if (!chore_id || !member_id) {
      return NextResponse.json({ error: 'chore_id and member_id required' }, { status: 400 });
    }
    const db = getDb();
    const chore = db.prepare('SELECT * FROM chores WHERE id = ?').get(chore_id) as { points: number } | undefined;
    if (!chore) return NextResponse.json({ error: 'Chore not found' }, { status: 404 });

    const insertCompletion = db.prepare(
      'INSERT INTO completions (chore_id, member_id) VALUES (?, ?)'
    );
    const updatePoints = db.prepare(
      'UPDATE members SET total_points = total_points + ? WHERE id = ?'
    );

    const doComplete = db.transaction(() => {
      const result = insertCompletion.run(chore_id, member_id);
      updatePoints.run(chore.points, member_id);
      return result;
    });

    const result = doComplete();
    const completion = db.prepare(`
      SELECT co.id, co.chore_id, co.member_id, co.completed_at,
             ch.title as chore_title, ch.frequency, ch.points,
             m.name as member_name, m.color as member_color
      FROM completions co
      JOIN chores ch ON co.chore_id = ch.id
      JOIN members m ON co.member_id = m.id
      WHERE co.id = ?
    `).get(result.lastInsertRowid);
    return NextResponse.json(completion, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
