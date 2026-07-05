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
import styles from '@/styles/cabinet.module.css';

interface Group {
  id: string;
  name: string;
}

interface Coach {
  id: string;
  user: { firstName: string; lastName: string };
}

export default function AdminNewSessionPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [groupId, setGroupId] = useState('');
  const [coachId, setCoachId] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Group[]>>('/groups');
      return res.data ?? [];
    },
  });

  const { data: coaches } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Coach[]>>('/coaches');
      return res.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/schedule', {
        groupId,
        coachId: coachId || undefined,
        venue,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      }),
    onSuccess: () => router.push('/admin/schedule'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новое занятие">
      <Link href="/admin/schedule" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К расписанию</Link>
      <h1 className={styles.pageTitle}>Новое занятие</h1>

      <Card title="Параметры">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 520 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}

          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Группа</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
              <option value="">Выберите группу</option>
              {groups?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Тренер</label>
            <select
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            >
              <option value="">Не указан</option>
              {coaches?.map((c) => (
                <option key={c.id} value={c.id}>{c.user.firstName} {c.user.lastName}</option>
              ))}
            </select>
          </div>

          <Input label="Место" value={venue} onChange={(e) => setVenue(e.target.value)} required />
          <Input label="Начало" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          <Input label="Конец" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />

          <Button type="submit" loading={mutation.isPending}>Создать</Button>
        </form>
      </Card>
    </DashboardShell>
  );
}
