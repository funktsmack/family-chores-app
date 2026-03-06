'use client';

import { useState } from 'react';
import { Member } from './ChoreCard';

interface Props {
  members: Member[];
  onClose: () => void;
  onEdit: (member: Member) => void;
  onDelete: (memberId: number) => Promise<void>;
  onAdd: () => void;
}

export default function ManageMembersModal({ members, onClose, onEdit, onDelete, onAdd }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Manage Members</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {members.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">No members yet</p>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: m.color }}
                >
                  {m.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.name}</p>
                  <p className="text-xs text-amber-600">{m.total_points} pts</p>
                </div>
                <button
                  onClick={() => onEdit(m)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={deletingId === m.id}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onAdd}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + Add Member
        </button>
      </div>
    </div>
  );
}
