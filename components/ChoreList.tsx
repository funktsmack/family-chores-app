'use client';

import ChoreCard, { Chore, Member } from './ChoreCard';

interface Props {
  chores: Chore[];
  members: Member[];
  completedChoreIds: Set<number>;
  activeTab: 'daily' | 'weekly' | 'monthly';
  onTabChange: (tab: 'daily' | 'weekly' | 'monthly') => void;
  onComplete: (choreId: number, memberId: number) => Promise<void>;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: number) => Promise<void>;
}

const TABS: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];

export default function ChoreList({
  chores,
  members,
  completedChoreIds,
  activeTab,
  onTabChange,
  onComplete,
  onEdit,
  onDelete,
}: Props) {
  const filtered = chores.filter((c) => c.frequency === activeTab);

  const tabColors = {
    daily: 'border-blue-500 text-blue-600',
    weekly: 'border-purple-500 text-purple-600',
    monthly: 'border-amber-500 text-amber-600',
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? tabColors[tab]
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-2xl">🧹</p>
          <p className="mt-2 text-sm font-medium text-gray-500">No {activeTab} chores yet</p>
          <p className="text-xs text-gray-400">Add one with the button above</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              members={members}
              isCompleted={completedChoreIds.has(chore.id)}
              onComplete={onComplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
