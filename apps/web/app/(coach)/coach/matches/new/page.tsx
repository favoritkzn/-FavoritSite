'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { CoachDashboardStats } from '@/hooks/useDashboard';
import { apiPost } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

export default function CoachNewMatchPage() {
  const router = useRouter();
  const { data: dash } = useDashboard();
  const groups = (dash as CoachDashboardStats | undefined)?.groups ?? [];
  const [opponent, setOpponent] = useState('');
  const [playedAt, setPlayedAt] = useState('');
  const [groupName, setGroupName] = useState(groups[0]?.name ?? '');
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/matches', {
        title: `Матч vs ${opponent}`,
        opponent,
        playedAt,
        groupName: groupName || undefined,
        homeScore: Number(homeScore) || 0,
        awayScore: Number(awayScore) || 0,
      }),
    onSuccess: () => router.push('/coach/matches'),
  });

  return (
    <DashboardShell role={UserRole.COACH} title="Новый матч">
      <h1 className={styles.pageTitle}>Записать матч</h1>
      <Card title="Результат">
        <form
          className={styles.form}
          style={{ marginTop: 16, maxWidth: 420 }}
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <Input label="Соперник" value={opponent} onChange={(e) => setOpponent(e.target.value)} required />
          <Input label="Дата и время" type="datetime-local" value={playedAt} onChange={(e) => setPlayedAt(e.target.value)} required />
          {groups.length > 0 ? (
            <div>
              <label style={{ fontSize: 14, fontWeight: 500 }}>Группа</label>
              <select
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <Input label="Группа" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          )}
          <div className={styles.formRow}>
            <Input label="Наш счёт" type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
            <Input label="Счёт соперника" type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
          </div>
          {mutation.isError && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{mutation.error.message}</p>}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" loading={mutation.isPending}>Сохранить</Button>
            <Link href="/coach/matches"><Button type="button" variant="secondary">Отмена</Button></Link>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
