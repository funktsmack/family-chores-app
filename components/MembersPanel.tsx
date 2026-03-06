'use client';

import { Member } from './ChoreCard';

interface Props {
  members: Member[];
  onManageMembers: () => void;
  onViewHistory: () => void;
}

export default function MembersPanel({ members, onManageMembers, onViewHistory }: Props) {
  const sorted = [...members].sort((a, b) => b.total_points - a.total_points);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">
          Members &amp; Points
        </h2>

        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400">No members yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((member, idx) => (
              <div key={member.id} className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-gray-800 truncate">{member.name}</span>
                    {idx < 3 && <span className="text-base">{medals[idx]}</span>}
                  </div>
                  <div className="mt-0.5 h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: member.color,
                        width: sorted[0].total_points > 0
                          ? `${(member.total_points / sorted[0].total_points) * 100}%`
                          : '0%',
                      }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-amber-600">
                  {member.total_points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onManageMembers}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        Manage Members
      </button>

      <button
        onClick={onViewHistory}
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
      >
        View History
      </button>
    </div>
  );
}
