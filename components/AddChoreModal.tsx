'use client';

import { useState, useEffect } from 'react';
import { Chore, Member } from './ChoreCard';

interface Props {
  members: Member[];
  editingChore: Chore | null;
  onClose: () => void;
  onSave: (data: { title: string; frequency: string; member_id: number | null; points: number }) => Promise<void>;
}

export default function AddChoreModal({ members, editingChore, onClose, onSave }: Props) {
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [memberId, setMemberId] = useState<number | null>(null);
  const [points, setPoints] = useState(5);
  const [loading, setLoading] = useState(false);

  const defaultPoints = { daily: 5, weekly: 10, monthly: 20 };

  useEffect(() => {
    if (editingChore) {
      setTitle(editingChore.title);
      setFrequency(editingChore.frequency);
      setMemberId(editingChore.member_id);
      setPoints(editingChore.points);
    } else {
      setTitle('');
      setFrequency('daily');
      setMemberId(null);
      setPoints(5);
    }
  }, [editingChore]);

  function handleFrequencyChange(f: 'daily' | 'weekly' | 'monthly') {
    setFrequency(f);
    if (!editingChore) setPoints(defaultPoints[f]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onSave({ title, frequency, member_id: memberId, points });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-gray-800">
          {editingChore ? 'Edit Chore' : 'Add New Chore'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean kitchen"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFrequencyChange(f)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium capitalize transition-colors ${
                    frequency === f
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Assign to (optional)</label>
            <select
              value={memberId ?? ''}
              onChange={(e) => setMemberId(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Anyone</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Points</label>
            <input
              type="number"
              min={1}
              max={100}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : editingChore ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
