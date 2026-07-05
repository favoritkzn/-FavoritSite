'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPost, ApiError } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  sessions: number;
}

export default function AdminAssignSubscriptionPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [childId, setChildId] = useState('');
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: children } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Child[]>>('/children');
      return res.data ?? [];
    },
  });

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans', 'all'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Plan[]>>('/subscriptions/plans?all=true');
      return res.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: () => apiPost('/subscriptions/assign', { childId, planId, startDate }),
    onSuccess: () => router.push('/admin/subscriptions'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось назначить'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Назначить абонемент">
      <Link href="/admin/subscriptions" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      <h1 className={styles.pageTitle}>Назначить абонемент</h1>

      <Card title="Параметры">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 480 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}

          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Ученик</label>
            <select
              value={childId}
              onChange={(e) => setChildId(e.target.value)}
              required
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
              <option value="">Выберите ученика</option>
              {children?.map((c) => (
                <option key={c.id} value={c.id}>{fullName(c.firstName, c.lastName)}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Тариф</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              required
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
              <option value="">Выберите тариф</option>
              {plans?.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sessions} трен.)</option>
              ))}
            </select>
          </div>

          <Input label="Дата начала" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

          <Button type="submit" loading={mutation.isPending}>Назначить</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
