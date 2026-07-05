'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPost } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Payment {
  id: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
}

const STATUS_LABELS: Record<string, string> = {
  SUCCEEDED: 'Оплачен',
  PENDING: 'Ожидает',
  PROCESSING: 'В обработке',
  FAILED: 'Ошибка',
  REFUNDED: 'Возврат',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  SUCCEEDED: 'success',
  PENDING: 'warning',
  PROCESSING: 'warning',
  FAILED: 'error',
  REFUNDED: 'default',
};

export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', 'all'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Payment[]>>('/payments');
      return res.data ?? [];
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => apiPost(`/payments/${id}/confirm`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments', 'all'] }),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Финансы">
      <h1 className={styles.pageTitle}>Платежи</h1>
      {isLoading && <div className={styles.skeletonList}>{[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={60} />)}</div>}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Нет платежей" />}
      {data && data.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пользователь</th>
              <th>Описание</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.createdAt)}</td>
                <td>{p.user.firstName} {p.user.lastName}</td>
                <td>{p.description ?? '—'}</td>
                <td>{formatPrice(p.amount)}</td>
                <td>
                  <Badge variant={STATUS_VARIANT[p.status] ?? 'default'}>
                    {STATUS_LABELS[p.status] ?? p.status}
                  </Badge>
                </td>
                <td>
                  {p.status === 'PENDING' && (
                    <Button
                      size="sm"
                      loading={confirmMutation.isPending}
                      onClick={() => confirmMutation.mutate(p.id)}
                    >
                      Подтвердить
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardShell>
  );
}
