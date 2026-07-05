'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Parent {
  id: string;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  children: Array<{ child: { firstName: string; lastName: string } }>;
}

export default function AdminParentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Parent[]>>('/parents');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Родители">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Родители</h1>
        <Link href="/admin/parents/new"><Button>Добавить</Button></Link>
      </div>
      {isLoading && <div className={styles.skeletonList}>{[1, 2].map((i) => <Skeleton key={i} variant="rect" height={60} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет родителей" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((p) => (
            <Link key={p.id} href={`/admin/parents/${p.id}`} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{fullName(p.user.firstName, p.user.lastName)}</div>
                <div className={styles.listItemMeta}>{p.user.email} · {p.user.phone ?? '—'}</div>
                <div className={styles.listItemMeta}>
                  Дети: {p.children.map((c) => fullName(c.child.firstName, c.child.lastName)).join(', ') || '—'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
