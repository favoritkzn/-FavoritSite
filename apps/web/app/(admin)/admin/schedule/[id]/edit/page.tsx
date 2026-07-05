'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiDelete, apiGet, apiPatch, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface Session {
  id: string;
  title: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  group: { id: string; name: string };
}

export default function AdminScheduleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState('');

  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Session>>(`/schedule/${id}`);
      return res.data!;
    },
  });

  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('SCHEDULED');

  useEffect(() => {
    if (session) {
      setTitle(session.title ?? '');
      setVenue(session.venue);
      setStartTime(session.startTime.slice(0, 16));
      setEndTime(session.endTime.slice(0, 16));
      setNotes(session.notes ?? '');
      setStatus(session.status);
    }
  }, [session]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPatch(`/schedule/${id}`, {
        title: title || undefined,
        venue,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        notes: notes || undefined,
        status,
      }),
    onSuccess: () => router.push('/admin/schedule'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/schedule/${id}`),
    onSuccess: () => router.push('/admin/schedule'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    saveMutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка сохранения'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Занятие">
      <Link href="/admin/schedule" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К расписанию</Link>
      {isLoading && <Skeleton variant="rect" height={300} />}
      {isError && <EmptyState title="Занятие не найдено" />}
      {session && (
        <>
          <h1 className={styles.pageTitle}>{session.group.name}</h1>
          <Card title="Редактирование">
            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 520 }}>
              {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
              <Input label="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Место" value={venue} onChange={(e) => setVenue(e.target.value)} required />
              <Input label="Начало" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              <Input label="Конец" type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Статус</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <option value="SCHEDULED">Запланировано</option>
                  <option value="IN_PROGRESS">Идёт</option>
                  <option value="COMPLETED">Завершено</option>
                  <option value="CANCELLED">Отменено</option>
                </select>
              </div>
              <Input label="Заметки" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="submit" loading={saveMutation.isPending}>Сохранить</Button>
                <Button type="button" variant="secondary" loading={deleteMutation.isPending} onClick={() => { if (confirm('Удалить занятие?')) deleteMutation.mutate(); }}>Удалить</Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
