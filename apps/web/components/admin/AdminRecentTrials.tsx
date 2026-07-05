'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from './AdminRecentTrials.module.css';

interface TrialRegistration {
  id: string;
  childName: string;
  parentName: string;
  phone: string;
  status: string;
  createdAt: string;
}

export function AdminRecentTrials() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['trial', 'recent'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<TrialRegistration[]>>('/trial?status=NEW');
      return (res.data ?? []).slice(0, 5);
    },
    refetchInterval: 10_000,
    staleTime: 0,
  });

  return (
    <Card title="Новые заявки на пробное" className={styles.card}>
      {isLoading && <Skeleton variant="rect" height={80} />}
      {isError && (
        <div className={styles.error}>
          <p>Не удалось загрузить заявки. Проверьте, что API запущен.</p>
          <Button size="sm" variant="secondary" onClick={() => refetch()}>
            Повторить
          </Button>
        </div>
      )}
      {!isLoading && !isError && data?.length === 0 && (
        <p className={styles.empty}>Новых заявок нет. Форма: /contacts</p>
      )}
      {data && data.length > 0 && (
        <ul className={styles.list}>
          {data.map((t) => (
            <li key={t.id} className={styles.item}>
              <div>
                <strong>{t.childName}</strong>
                <span className={styles.meta}>
                  {t.parentName} · {t.phone} · {formatDate(t.createdAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        <Link href="/admin/trial">
          <Button size="sm" variant="secondary" loading={isFetching}>
            Все пробные заявки →
          </Button>
        </Link>
      </div>
    </Card>
  );
}
