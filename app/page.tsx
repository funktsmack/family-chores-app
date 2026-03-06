'use client';

import { useState, useEffect, useCallback } from 'react';
import ChoreList from '@/components/ChoreList';
import MembersPanel from '@/components/MembersPanel';
import AddChoreModal from '@/components/AddChoreModal';
import AddMemberModal from '@/components/AddMemberModal';
import ManageMembersModal from '@/components/ManageMembersModal';
import HistoryDrawer from '@/components/HistoryDrawer';
import { Chore, Member } from '@/components/ChoreCard';

interface Completion {
  id: number;
  chore_id: number;
  member_id: number;
  completed_at: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

function isCompletedInPeriod(completion: Completion): boolean {
  const now = new Date();
  const d = new Date(completion.completed_at);

  if (completion.frequency === 'daily') {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (completion.frequency === 'weekly') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }
  if (completion.frequency === 'monthly') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  return false;
}

export default function Dashboard() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const [showAddChore, setShowAddChore] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadData = useCallback(async () => {
    const [choresRes, membersRes, completionsRes] = await Promise.all([
      fetch('/api/chores'),
      fetch('/api/members'),
      fetch('/api/completions'),
    ]);
    const [choresData, membersData, completionsData] = await Promise.all([
      choresRes.json(),
      membersRes.json(),
      completionsRes.json(),
    ]);
    setChores(choresData);
    setMembers(membersData);
    setCompletions(completionsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build set of completed chore IDs for current period
  const completedChoreIds = new Set(
    completions
      .filter(isCompletedInPeriod)
      .map((c) => c.chore_id)
  );

  async function handleComplete(choreId: number, memberId: number) {
    const res = await fetch('/api/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chore_id: choreId, member_id: memberId }),
    });
    if (res.ok) {
      await loadData();
    }
  }

  async function handleSaveChore(data: {
    title: string;
    frequency: string;
    member_id: number | null;
    points: number;
  }) {
    if (editingChore) {
      await fetch(`/api/chores/${editingChore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/chores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setShowAddChore(false);
    setEditingChore(null);
    await loadData();
  }

  async function handleDeleteChore(choreId: number) {
    await fetch(`/api/chores/${choreId}`, { method: 'DELETE' });
    await loadData();
  }

  async function handleSaveMember(data: { name: string; color: string }) {
    if (editingMember) {
      await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }
    setShowAddMember(false);
    setEditingMember(null);
    setShowManageMembers(false);
    await loadData();
  }

  async function handleDeleteMember(memberId: number) {
    await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
    await loadData();
  }

  function handleEditChore(chore: Chore) {
    setEditingChore(chore);
    setShowAddChore(true);
  }

  function handleEditMember(member: Member) {
    setEditingMember(member);
    setShowManageMembers(false);
    setShowAddMember(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <h1 className="text-lg font-bold text-gray-800">Family Chores</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingChore(null); setShowAddChore(true); }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              + Add Chore
            </button>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Chore list */}
          <div className="flex-1 min-w-0">
            <ChoreList
              chores={chores}
              members={members}
              completedChoreIds={completedChoreIds}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onComplete={handleComplete}
              onEdit={handleEditChore}
              onDelete={handleDeleteChore}
            />
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <MembersPanel
              members={members}
              onManageMembers={() => setShowManageMembers(true)}
              onViewHistory={() => setShowHistory(true)}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAddChore && (
        <AddChoreModal
          members={members}
          editingChore={editingChore}
          onClose={() => { setShowAddChore(false); setEditingChore(null); }}
          onSave={handleSaveChore}
        />
      )}

      {showManageMembers && !showAddMember && (
        <ManageMembersModal
          members={members}
          onClose={() => setShowManageMembers(false)}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          onAdd={() => { setEditingMember(null); setShowAddMember(true); setShowManageMembers(false); }}
        />
      )}

      {showAddMember && (
        <AddMemberModal
          editingMember={editingMember}
          onClose={() => { setShowAddMember(false); setEditingMember(null); }}
          onSave={handleSaveMember}
        />
      )}

      {/* History drawer */}
      <HistoryDrawer open={showHistory} onClose={() => setShowHistory(false)} />
    </div>
  );
}
