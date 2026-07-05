'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface Group {
  id: string;
  name: string;
  description: string | null;
  ageCategory: string;
  isActive: boolean;
  _count?: { children: number };
}

export default function AdminGroupsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Group[]>>('/groups');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Группы">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Группы</h1>
        <Link href="/admin/groups/new"><Button>Добавить</Button></Link>
      </div>
      {isLoading && <div className={styles.grid}>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={80} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет групп" />}
      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((g) => (
            <Link key={g.id} href={`/admin/groups/${g.id}`} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{g.name}</div>
                <div className={styles.listItemMeta}>
                  {g.ageCategory} · {g._count?.children ?? 0} учеников
                </div>
                {g.description && <div className={styles.listItemMeta}>{g.description}</div>}
                <div style={{ marginTop: 8 }}>
                  <Badge variant={g.isActive ? 'success' : 'default'}>
                    {g.isActive ? 'Активна' : 'Неактивна'}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
