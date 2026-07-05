'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Avatar, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { calcAge, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  photo: string | null;
  isActive: boolean;
  groups: Array<{ group: { name: string } }>;
}

export default function AdminChildrenPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Child[]>>('/children');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Дети">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>Ученики</h1>
        <Link href="/admin/children/new"><Button>Добавить</Button></Link>
      </div>
      {isLoading && <div className={styles.skeletonList}>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={60} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет учеников" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((child) => (
            <Link key={child.id} href={`/admin/children/${child.id}`} className={styles.listItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar src={child.photo} name={fullName(child.firstName, child.lastName)} />
                <div>
                  <div className={styles.listItemTitle}>{fullName(child.firstName, child.lastName)}</div>
                  <div className={styles.listItemMeta}>
                    {child.groups[0]?.group.name ?? 'Без группы'} · {calcAge(child.birthDate)} лет
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
