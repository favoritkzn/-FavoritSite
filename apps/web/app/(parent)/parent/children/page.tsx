'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Avatar, EmptyState, Skeleton } from '@favorit/ui';
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
  groups: Array<{ group: { name: string } }>;
}

export default function ParentChildrenPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Child[]>>('/children');
      return res.data ?? [];
    },
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Дети">
      <h1 className={styles.pageTitle}>Мои дети</h1>
      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={80} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить данные" />}
      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Дети не привязаны" description="Если вы только зарегистрировались — дождитесь подтверждения администратором. Если ребёнок уже занимается — напишите в академию." />
      )}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((child) => (
            <Link key={child.id} href={`/parent/children/${child.id}`} className={styles.listItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
