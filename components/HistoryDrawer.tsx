'use client';

import { useEffect, useState } from 'react';

interface Completion {
  id: number;
  chore_id: number;
  member_id: number;
  completed_at: string;
  chore_title: string;
  frequency: string;
  points: number;
  member_name: string;
  member_color: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryDrawer({ open, onClose }: Props) {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/completions')
      .then((r) => r.json())
      .then((data) => { setCompletions(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [open]);

  async function handleUndo(id: number) {
    await fetch(`/api/completions/${id}`, { method: 'DELETE' });
    setCompletions((prev) => prev.filter((c) => c.id !== id));
  }

  const freqColors: Record<string, string> = {
    daily: 'bg-blue-100 text-blue-700',
    weekly: 'bg-purple-100 text-purple-700',
    monthly: 'bg-amber-100 text-amber-700',
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
          <h2 className="text-base font-bold text-gray-800">Completion History</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            </div>
          ) : completions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-2xl">📋</p>
              <p className="mt-2 text-sm text-gray-500">No completions yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {completions.map((c) => (
                <div key={c.id} className="flex items-start justify-between gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: c.member_color }}
                    >
                      {c.member_name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.chore_title}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-500">{c.member_name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${freqColors[c.frequency]}`}>
                          {c.frequency}
                        </span>
                        <span className="text-xs font-semibold text-amber-600">+{c.points} pts</span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(c.completed_at)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUndo(c.id)}
                    className="shrink-0 rounded px-2 py-1 text-xs text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Undo"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
