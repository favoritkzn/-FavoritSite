'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Match {
  id: string;
  title: string;
  opponent: string;
  playedAt: string;
  venue: string | null;
  homeScore: number | null;
  awayScore: number | null;
  groupName: string | null;
}

export default function CoachMatchesPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Match[]>>('/matches');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.COACH} title="Матчи">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className={styles.pageTitle}>Матчи</h1>
        <Link href="/coach/matches/new"><Button>Добавить матч</Button></Link>
      </div>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={72} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить матчи" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Матчей пока нет" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((m) => (
            <Link key={m.id} href={`/coach/matches/${m.id}`} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{m.title}</div>
                <div className={styles.listItemMeta}>
                  vs {m.opponent} · {formatDate(m.playedAt)}
                </div>
              </div>
              <Badge variant="primary">
                {m.homeScore ?? '–'}:{m.awayScore ?? '–'}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
