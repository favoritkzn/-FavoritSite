'use client';

import { use, useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { CoachDashboardStats } from '@/hooks/useDashboard';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';
import { formatDate, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface MatchEvent {
  id: string;
  type: string;
  child: { id: string; firstName: string; lastName: string };
}

interface Match {
  id: string;
  opponent: string;
  playedAt: string;
  homeScore: number | null;
  awayScore: number | null;
  groupName: string | null;
  events: MatchEvent[];
}

interface RosterChild {
  id: string;
  firstName: string;
  lastName: string;
}

export default function CoachMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const { data: dash } = useDashboard();
  const groups = (dash as CoachDashboardStats | undefined)?.groups ?? [];
  const primaryGroupId = groups[0]?.id;

  const [childId, setChildId] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  const { data: match, isLoading, isError } = useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Match>>(`/matches/${id}`);
      return res.data!;
    },
  });

  const { data: roster } = useQuery({
    queryKey: ['groups', primaryGroupId, 'roster'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<RosterChild[]>>(`/groups/${primaryGroupId}/roster`);
      return res.data ?? [];
    },
    enabled: !!primaryGroupId,
  });

  useEffect(() => {
    if (match) {
      setHomeScore(String(match.homeScore ?? 0));
      setAwayScore(String(match.awayScore ?? 0));
    }
  }, [match]);

  const scoreMutation = useMutation({
    mutationFn: () =>
      apiPatch(`/matches/${id}`, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', id] }),
  });

  const addGoalMutation = useMutation({
    mutationFn: () => apiPost(`/matches/${id}/events`, { childId, type: 'GOAL' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
      setChildId('');
    },
  });

  const removeEventMutation = useMutation({
    mutationFn: (eventId: string) => apiDelete(`/matches/events/${eventId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches', id] }),
  });

  const goals = match?.events.filter((e) => e.type === 'GOAL') ?? [];

  return (
    <DashboardShell role={UserRole.COACH} title="Матч">
      {isLoading && <Skeleton variant="rect" height={200} />}
      {isError && <EmptyState title="Матч не найден" />}
      {match && (
        <>
          <h1 className={styles.pageTitle}>vs {match.opponent}</h1>
          <p className={styles.listItemMeta} style={{ marginBottom: 16 }}>
            {formatDate(match.playedAt)}
            {match.groupName ? ` · ${match.groupName}` : ''}
          </p>

          <Card title="Счёт">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                scoreMutation.mutate();
              }}
              className={styles.form}
              style={{ marginTop: 12, maxWidth: 320 }}
            >
              <div className={styles.formRow}>
                <Input label="Мы" type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
                <Input label="Они" type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
              </div>
              <Button type="submit" size="sm" loading={scoreMutation.isPending}>Обновить счёт</Button>
            </form>
          </Card>

          <Card title="Кто забил" style={{ marginTop: 24 }}>
            {roster && roster.length > 0 ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (childId) addGoalMutation.mutate();
                }}
                className={styles.form}
                style={{ marginTop: 12, maxWidth: 400 }}
              >
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Игрок</label>
                  <select
                    value={childId}
                    onChange={(e) => setChildId(e.target.value)}
                    required
                    style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
                  >
                    <option value="">Выберите игрока</option>
                    {roster.map((c) => (
                      <option key={c.id} value={c.id}>{fullName(c.firstName, c.lastName)}</option>
                    ))}
                  </select>
                </div>
                <Button type="submit" loading={addGoalMutation.isPending}>Добавить гол</Button>
              </form>
            ) : (
              <EmptyState title="Нет игроков" description="Добавьте учеников в группу через администратора" />
            )}
            {goals.length > 0 && (
              <div className={styles.list} style={{ marginTop: 16 }}>
                {goals.map((e) => (
                  <div key={e.id} className={styles.listItem}>
                    <span>⚽ {fullName(e.child.firstName, e.child.lastName)}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={removeEventMutation.isPending}
                      onClick={() => removeEventMutation.mutate(e.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Link href="/coach/matches" style={{ marginTop: 24, display: 'inline-block' }}>
            <Button variant="secondary">← К матчам</Button>
          </Link>
        </>
      )}
    </DashboardShell>
  );
}
