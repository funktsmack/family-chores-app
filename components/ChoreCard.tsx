'use client';

import { useState } from 'react';

export interface Chore {
  id: number;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  member_id: number | null;
  member_name: string | null;
  member_color: string | null;
  points: number;
  created_at: string;
}

export interface Member {
  id: number;
  name: string;
  color: string;
  total_points: number;
}

interface Props {
  chore: Chore;
  members: Member[];
  isCompleted: boolean;
  onComplete: (choreId: number, memberId: number) => Promise<void>;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: number) => Promise<void>;
}

export default function ChoreCard({ chore, members, isCompleted, onComplete, onEdit, onDelete }: Props) {
  const [showWho, setShowWho] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDone() {
    if (chore.member_id) {
      setLoading(true);
      await onComplete(chore.id, chore.member_id);
      setLoading(false);
    } else {
      setShowWho(true);
    }
  }

  async function handleSelectMember(memberId: number) {
    setShowWho(false);
    setLoading(true);
    await onComplete(chore.id, memberId);
    setLoading(false);
  }

  const freqColors: Record<string, string> = {
    daily: 'bg-blue-100 text-blue-700',
    weekly: 'bg-purple-100 text-purple-700',
    monthly: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className={`relative rounded-xl border p-4 transition-all ${isCompleted ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white shadow-sm hover:shadow-md'}`}>
      {showWho && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/95 p-4 shadow-lg">
          <p className="text-sm font-semibold text-gray-700">Who completed this?</p>
          <div className="flex flex-wrap justify-center gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelectMember(m.id)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: m.color }}
              >
                {m.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowWho(false)} className="mt-1 text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-medium truncate ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {chore.title}
            </h3>
            {isCompleted && (
              <span className="text-green-500 text-lg">✓</span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${freqColors[chore.frequency]}`}>
              {chore.frequency}
            </span>
            <span className="text-xs font-semibold text-amber-600">{chore.points} pts</span>
            {chore.member_name && (
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: chore.member_color || '#6366f1' }}
              >
                {chore.member_name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isCompleted && (
            <button
              onClick={handleDone}
              disabled={loading}
              className="rounded-lg bg-green-500 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? '...' : 'Done ✓'}
            </button>
          )}
          <button
            onClick={() => onEdit(chore)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(chore.id)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
