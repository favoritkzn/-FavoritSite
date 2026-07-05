'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Avatar, Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet } from '@/lib/api';
import { calcAge, formatShortDate, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  photo: string | null;
  medicalInfo: string | null;
  groups: Array<{ group: { id: string; name: string } }>;
}

export default function ParentChildDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: child, isLoading, isError } = useQuery({
    queryKey: ['children', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Child>>(`/children/${id}`);
      return res.data!;
    },
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Ребёнок">
      {isLoading && <Skeleton variant="rect" height={200} />}
      {isError && <EmptyState title="Не удалось загрузить профиль" />}
      {child && (
        <>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 24 }}>
            <Avatar src={child.photo} name={fullName(child.firstName, child.lastName)} size="lg" />
            <div>
              <h1 className={styles.pageTitle}>{fullName(child.firstName, child.lastName)}</h1>
              <p className={styles.listItemMeta}>
                {calcAge(child.birthDate)} лет · {formatShortDate(child.birthDate)}
              </p>
            </div>
          </div>
          <div className={styles.grid}>
            <Card title="Группа">
              <p>{child.groups[0]?.group.name ?? 'Не назначена'}</p>
            </Card>
            <Card title="Мед. информация">
              <p>{child.medicalInfo ?? 'Не указана'}</p>
            </Card>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Link href="/parent/attendance"><Button variant="secondary">Посещаемость</Button></Link>
            <Link href="/parent/subscription"><Button variant="secondary">Абонемент</Button></Link>
            <Link href="/parent/children"><Button variant="ghost">← Назад</Button></Link>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
