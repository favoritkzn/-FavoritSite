'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { ParentDashboardStats } from '@/hooks/useDashboard';
import { apiGet, apiPost } from '@/lib/api';
import { formatPrice, fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Plan {
  id: string;
  name: string;
  price: number;
  sessions: number;
}

interface AcademySettings {
  value: {
    paymentCard?: string;
    paymentCardHolder?: string;
    paymentInstructions?: string;
  };
}

export default function ParentNewPaymentPage() {
  const router = useRouter();
  const { data: dash } = useDashboard();
  const children = (dash as ParentDashboardStats | undefined)?.children ?? [];
  const [childId, setChildId] = useState('');
  const [planId, setPlanId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!childId && children[0]?.id) {
      setChildId(children[0].id);
    }
  }, [children, childId]);

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Plan[]>>('/subscriptions/plans', { auth: false });
      return res.data ?? [];
    },
  });

  const { data: academy } = useQuery({
    queryKey: ['cms', 'academy'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<AcademySettings>>('/cms/settings/academy', { auth: false });
      return res.data?.value;
    },
  });

  useEffect(() => {
    if (!planId && plans?.[0]?.id) {
      setPlanId(plans[0].id);
    }
  }, [plans, planId]);

  const child = children.find((c) => c.id === childId);
  const sub = child?.subscriptions[0];
  const plan = plans?.find((p) => p.id === planId) ?? plans?.[0];
  const isRenewal = !!sub;

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/payments/subscription', {
        childId,
        ...(isRenewal ? { subscriptionId: sub.id } : { planId }),
        amount: plan?.price ?? 0,
        description: isRenewal
          ? `Оплата продления «${plan?.name}» (перевод на карту)`
          : `Оплата «${plan?.name}» (перевод на карту)`,
      }),
    onSuccess: () => setSubmitted(true),
  });

  const paymentCard = academy?.paymentCard ?? '2202 2082 5979 0732';

  function copyCard() {
    void navigator.clipboard.writeText(paymentCard.replace(/\s/g, ''));
  }

  if (submitted) {
    return (
      <DashboardShell role={UserRole.PARENT} title="Оплата">
        <Card title="Заявка отправлена">
          <p style={{ marginTop: 12 }}>
            Мы получили уведомление об оплате. Администратор проверит поступление на карту и активирует абонемент.
          </p>
          <Button style={{ marginTop: 16 }} onClick={() => router.push('/parent/payments')}>
            К списку платежей
          </Button>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={UserRole.PARENT} title="Оплата">
      <h1 className={styles.pageTitle}>Оплата абонемента</h1>
      {children.length === 0 ? (
        <EmptyState
          title="Нет привязанных детей"
          description="Дождитесь подтверждения регистрации администратором."
        />
      ) : plansLoading ? (
        <Skeleton variant="rect" height={200} />
      ) : !plans?.length ? (
        <EmptyState title="Тарифы не настроены" description="Обратитесь к администратору академии." />
      ) : (
        <div style={{ display: 'grid', gap: 16, maxWidth: 520 }}>
          <Card title="1. Выберите тариф">
            <div className={styles.form} style={{ marginTop: 12 }}>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Ребёнок</label>
                <select
                  value={childId}
                  onChange={(e) => setChildId(e.target.value)}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 8, border: '1px solid var(--color-border)' }}
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {fullName(c.firstName, c.lastName)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Тариф</label>
                <select
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 8, border: '1px solid var(--color-border)' }}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPrice(p.price)} ({p.sessions} трен.)
                    </option>
                  ))}
                </select>
              </div>
              {plan && (
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>
                  К оплате: {formatPrice(plan.price)}
                </p>
              )}
            </div>
          </Card>

          <Card title="2. Переведите на карту">
            <div style={{ marginTop: 12 }}>
              <p className={styles.listItemMeta}>
                {academy?.paymentCardHolder ?? 'ФК «Фаворит»'}
              </p>
              <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.06em', margin: '12px 0' }}>
                {paymentCard}
              </p>
              <Button type="button" variant="secondary" size="sm" onClick={copyCard}>
                Скопировать номер
              </Button>
              <p className={styles.listItemMeta} style={{ marginTop: 16 }}>
                {academy?.paymentInstructions ??
                  'Переведите сумму на карту. В комментарии укажите фамилию ребёнка.'}
              </p>
            </div>
          </Card>

          <Card title="3. Подтвердите оплату">
            <p className={styles.listItemMeta} style={{ marginTop: 12 }}>
              После перевода нажмите кнопку ниже — администратор проверит поступление и активирует абонемент.
            </p>
            {mutation.isError && (
              <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{mutation.error.message}</p>
            )}
            <Button
              style={{ marginTop: 16 }}
              loading={mutation.isPending}
              onClick={() => mutation.mutate()}
              disabled={!childId || !planId}
            >
              Я оплатил
            </Button>
          </Card>
        </div>
      )}
    </DashboardShell>
  );
}
