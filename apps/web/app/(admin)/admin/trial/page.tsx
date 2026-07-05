'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface TrialRegistration {
  id: string;
  childName: string;
  parentName: string;
  phone: string;
  email: string | null;
  birthDate: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  NEW: 'Новая',
  CONTACTED: 'Связались',
  SCHEDULED: 'Записана',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};

const STATUS_VARIANT: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  NEW: 'primary',
  CONTACTED: 'warning',
  SCHEDULED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const NEXT_STATUS: Record<string, string[]> = {
  NEW: ['CONTACTED', 'SCHEDULED', 'CANCELLED'],
  CONTACTED: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
  SCHEDULED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminTrialPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('');
  const [convertGroupId, setConvertGroupId] = useState<Record<string, string>>({});

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Array<{ id: string; name: string }>>>('/groups');
      return res.data ?? [];
    },
  });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['trial', filter],
    queryFn: async () => {
      const path = filter ? `/trial?status=${filter}` : '/trial';
      const res = await apiGet<ApiResponse<TrialRegistration[]>>(path);
      return res.data ?? [];
    },
    refetchInterval: 10_000,
    staleTime: 0,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch(`/trial/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trial'] }),
  });

  const convertMutation = useMutation({
    mutationFn: ({ id, groupId }: { id: string; groupId?: string }) =>
      apiPost(`/trial/${id}/convert`, { groupId: groupId || undefined }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trial'] }),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Пробные занятия">
      <h1 className={styles.pageTitle}>Заявки на пробное занятие</h1>
      <p className={styles.listItemMeta} style={{ marginBottom: 20 }}>
        Сюда попадают заявки с формы на странице «Контакты». Регистрация личного кабинета — в разделе{' '}
        <Link href="/admin/registrations" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          Кабинеты родителей
        </Link>
        .
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          variant={filter === '' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('')}
        >
          Все
        </Button>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        </div>
        <Button size="sm" variant="secondary" loading={isFetching} onClick={() => refetch()}>
          Обновить
        </Button>
      </div>

      {!isLoading && data && (
        <p className={styles.listItemMeta} style={{ marginBottom: 16 }}>
          Всего заявок: <strong>{data.length}</strong>
          {filter ? ` (фильтр: ${STATUS_LABELS[filter] ?? filter})` : ''}
        </p>
      )}

      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={100} />)}
        </div>
      )}
      {isError && (
        <EmptyState
          title="Не удалось загрузить заявки"
          description={error instanceof Error ? error.message : 'Проверьте вход в админку и что API запущен на порту 4000'}
        />
      )}
      {!isLoading && data?.length === 0 && <EmptyState title="Заявок нет" />}

      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((t) => (
            <div key={t.id} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div className={styles.listItemTitle}>{t.childName}</div>
                  <div className={styles.listItemMeta}>
                    Родитель: {t.parentName} · {t.phone}
                    {t.email && ` · ${t.email}`}
                  </div>
                  <div className={styles.listItemMeta}>
                    {formatDate(t.createdAt)}
                    {t.birthDate && ` · ДР: ${formatDate(t.birthDate)}`}
                  </div>
                  {t.notes && <div className={styles.listItemMeta} style={{ marginTop: 4 }}>{t.notes}</div>}
                </div>
                <Badge variant={STATUS_VARIANT[t.status] ?? 'default'}>
                  {STATUS_LABELS[t.status] ?? t.status}
                </Badge>
              </div>
              {NEXT_STATUS[t.status]?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {NEXT_STATUS[t.status].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="secondary"
                      loading={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ id: t.id, status })}
                    >
                      → {STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
              )}
              {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
                  {groups && groups.length > 0 && (
                    <select
                      value={convertGroupId[t.id] ?? ''}
                      onChange={(e) => setConvertGroupId((prev) => ({ ...prev, [t.id]: e.target.value }))}
                      style={{ padding: 8, borderRadius: 8, border: '1px solid var(--color-border)' }}
                    >
                      <option value="">Без группы</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  )}
                  <Button
                    size="sm"
                    loading={convertMutation.isPending}
                    onClick={() => convertMutation.mutate({ id: t.id, groupId: convertGroupId[t.id] })}
                  >
                    Создать ученика{t.email ? ' + родителя' : ''}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
