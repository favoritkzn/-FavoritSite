'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import styles from '@/styles/public.module.css';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sessions: number;
  durationDays: number;
}

export default function PricingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Plan[]>>('/subscriptions/plans', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Стоимость</h1>
      <p className={styles.subtitle}>
        Абонементы на тренировки. Стоимость и условия уточняйте у администратора или через форму записи.
      </p>

      {isLoading && (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rect" height={200} />
          ))}
        </div>
      )}

      {isError && <EmptyState title="Не удалось загрузить тарифы" />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Тарифы не добавлены" description="Администратор настроит абонементы в панели управления" />
      )}

      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((plan) => (
            <div key={plan.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{plan.name}</h3>
              <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-primary)', margin: '12px 0' }}>
                {formatPrice(plan.price)}
              </p>
              <p className={styles.cardMeta}>
                {plan.sessions} тренировок · {plan.durationDays} дней
              </p>
              {plan.description && <p className={styles.cardMeta}>{plan.description}</p>}
              <Link href="/contacts#trial-form" style={{ marginTop: 16, display: 'inline-block' }}>
                <Button>Записаться на пробное</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
