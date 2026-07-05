'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPost } from '@/lib/api';
import { formatDate, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface PendingRegistration {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  createdAt: string;
  parent: {
    children: Array<{
      relation: string;
      child: {
        id: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        gender: string;
      };
    }>;
  } | null;
}

export default function AdminRegistrationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['registrations', 'pending'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<PendingRegistration[]>>('/users/registrations/pending');
      return res.data ?? [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: (userId: string) => apiPost(`/users/registrations/${userId}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrations', 'pending'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (userId: string) => apiPost(`/users/registrations/${userId}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registrations', 'pending'] }),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Кабинеты родителей">
      <h1 className={styles.pageTitle}>Регистрация личного кабинета</h1>
      <p className={styles.listItemMeta} style={{ marginBottom: 16 }}>
        Здесь — заявки на <strong>личный кабинет</strong> (email и пароль). Заявки на{' '}
        <strong>пробное занятие</strong> смотрите в разделе{' '}
        <Link href="/admin/trial" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          Пробные занятия
        </Link>
        .
      </p>
      <p className={styles.listItemMeta} style={{ marginBottom: 24 }}>
        Подтвердите заявку — родитель сможет войти и увидеть ребёнка в кабинете.
      </p>

      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={120} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить заявки" />}
      {!isLoading && data?.length === 0 && (
        <EmptyState title="Нет новых заявок" description="Когда родитель зарегистрируется на сайте, заявка появится здесь" />
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'grid', gap: 16 }}>
          {data.map((reg) => {
            const child = reg.parent?.children[0]?.child;
            return (
              <Card key={reg.id} title={fullName(reg.firstName, reg.lastName)}>
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <p className={styles.listItemMeta}>{reg.email}{reg.phone ? ` · ${reg.phone}` : ''}</p>
                  <p className={styles.listItemMeta}>Подана: {formatDate(reg.createdAt)}</p>
                  {child && (
                    <p style={{ fontWeight: 500 }}>
                      Ребёнок: {fullName(child.firstName, child.lastName)} · {formatDate(child.birthDate)}
                    </p>
                  )}
                  <Badge variant="warning">Ожидает подтверждения</Badge>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <Button
                      size="sm"
                      loading={approveMutation.isPending}
                      onClick={() => approveMutation.mutate(reg.id)}
                    >
                      Подтвердить
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate(reg.id)}
                    >
                      Отклонить
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
