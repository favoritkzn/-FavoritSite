'use client';

import Link from 'next/link';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface GroupInfo {
  id: string;
  name: string;
  ageCategory: string;
  description: string | null;
}

interface RosterEntry {
  child: {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
  };
}

export default function CoachGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const groupQuery = useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<GroupInfo>>(`/groups/${id}`);
      return res.data!;
    },
  });

  const rosterQuery = useQuery({
    queryKey: ['groups', id, 'roster'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<RosterEntry[]>>(`/groups/${id}/roster`);
      return res.data ?? [];
    },
  });

  const isLoading = groupQuery.isLoading || rosterQuery.isLoading;
  const isError = groupQuery.isError || rosterQuery.isError;
  const group = groupQuery.data;
  const roster = rosterQuery.data ?? [];

  return (
    <DashboardShell role={UserRole.COACH} title="Группа">
      <Link href="/coach/groups" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К группам</Link>
      {isLoading && <Skeleton variant="rect" height={200} style={{ marginTop: 16 }} />}
      {isError && <EmptyState title="Группа не найдена" />}
      {group && (
        <>
          <h1 className={styles.pageTitle}>{group.name}</h1>
          <p className={styles.listItemMeta}>{group.ageCategory}</p>
          {group.description && <p className={styles.listItemMeta}>{group.description}</p>}
          <Card title={`Ученики (${roster.length})`} style={{ marginTop: 24 }}>
            {roster.length === 0 ? (
              <EmptyState title="В группе пока никого" />
            ) : (
              <div className={styles.list} style={{ marginTop: 12 }}>
                {roster.map((entry) => (
                  <div key={entry.child.id} className={styles.listItem}>
                    <div className={styles.listItemTitle}>
                      {fullName(entry.child.firstName, entry.child.lastName)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
