import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const completion = db.prepare(`
      SELECT co.*, ch.points FROM completions co
      JOIN chores ch ON co.chore_id = ch.id
      WHERE co.id = ?
    `).get(id) as { member_id: number; points: number } | undefined;

    if (!completion) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const doDelete = db.transaction(() => {
      db.prepare('DELETE FROM completions WHERE id = ?').run(id);
      db.prepare('UPDATE members SET total_points = MAX(0, total_points - ?) WHERE id = ?')
        .run(completion.points, completion.member_id);
    });

    doDelete();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
