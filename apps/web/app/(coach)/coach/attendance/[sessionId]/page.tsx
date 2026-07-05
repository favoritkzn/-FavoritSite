'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPost } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

type AttendanceStatus = 'PRESENT' | 'ABSENT';

interface AttendanceEntry {
  child: { id: string; firstName: string; lastName: string };
  status: AttendanceStatus | null;
}

export default function CoachAttendanceSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [entries, setEntries] = useState<Record<string, AttendanceStatus>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', sessionId],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<AttendanceEntry[]>>(`/attendance/sessions/${sessionId}`);
      return res.data ?? [];
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: { childId: string; status: AttendanceStatus }[]) =>
      apiPost(`/attendance/sessions/${sessionId}/bulk`, { entries: payload }),
    onSuccess: () => router.push('/coach/attendance'),
  });

  const toggle = (childId: string) => {
    setEntries((prev) => {
      const current = prev[childId] ?? data?.find((e) => e.child.id === childId)?.status ?? 'PRESENT';
      return { ...prev, [childId]: current === 'PRESENT' ? 'ABSENT' : 'PRESENT' };
    });
  };

  return (
    <DashboardShell role={UserRole.COACH} title="Посещаемость">
      <h1 className={styles.pageTitle}>Кто пришёл</h1>
      <p className={styles.listItemMeta} style={{ marginBottom: 24 }}>
        Нажмите на имя, чтобы отметить отсутствие
      </p>
      {isLoading && <Skeleton variant="rect" height={300} />}
      {isError && <EmptyState title="Не удалось загрузить список" />}
      {data && data.length === 0 && <EmptyState title="В группе нет учеников" />}
      {data && data.length > 0 && (
        <>
          <div className={styles.attendanceGrid}>
            {data.map((entry) => {
              const childId = entry.child.id;
              const present = (entries[childId] ?? entry.status ?? 'PRESENT') === 'PRESENT';
              return (
                <button
                  key={childId}
                  type="button"
                  className={`${styles.attendanceRow} ${present ? styles.statusBtnActive : ''}`}
                  style={{
                    cursor: 'pointer',
                    border: present ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                    borderRadius: 12,
                    padding: '12px 16px',
                    background: present ? 'var(--color-primary-light, #f0f7ff)' : 'transparent',
                    textAlign: 'left',
                  }}
                  onClick={() => toggle(childId)}
                >
                  <span style={{ fontWeight: 600 }}>
                    {present ? '✓ ' : '✗ '}
                    {fullName(entry.child.firstName, entry.child.lastName)}
                  </span>
                </button>
              );
            })}
          </div>
          {mutation.isError && (
            <p style={{ color: 'var(--color-error)', marginTop: 12 }}>{mutation.error.message}</p>
          )}
          <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
            <Button
              loading={mutation.isPending}
              onClick={() =>
                mutation.mutate(
                  data.map((e) => ({
                    childId: e.child.id,
                    status: entries[e.child.id] ?? e.status ?? 'PRESENT',
                  })),
                )
              }
            >
              Сохранить
            </Button>
            <Button variant="secondary" onClick={() => router.back()}>Отмена</Button>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
