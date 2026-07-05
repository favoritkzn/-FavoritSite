'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard, type CoachDashboardStats } from '@/hooks/useDashboard';
import { apiGet, apiPost } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  group: { id: string; name: string };
}

export default function CoachAnnouncementsPage() {
  const qc = useQueryClient();
  const { data: dashboard } = useDashboard();
  const coach = dashboard as CoachDashboardStats | undefined;
  const groups = coach?.groups ?? [];

  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['announcements', 'my', 'coach'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Announcement[]>>('/announcements/my');
      return res.data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: () => apiPost('/announcements', { groupId, title, content }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      qc.invalidateQueries({ queryKey: ['announcements', 'my', 'coach'] });
    },
  });

  const canSubmit = groupId && title.trim() && content.trim();

  return (
    <DashboardShell role={UserRole.COACH} title="Объявления">
      <h1 className={styles.pageTitle}>Объявления</h1>

      {groups.length > 0 && (
        <Card title="Новое объявление" style={{ marginBottom: 24 }}>
          <div className={styles.form} style={{ marginTop: 16 }}>
            <label className={styles.listItemMeta}>
              Группа
              <select
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: 8, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
              >
                <option value="">Выберите группу</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>
            <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label className={styles.listItemMeta}>
              Текст
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                style={{ display: 'block', width: '100%', marginTop: 8, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', resize: 'vertical' }}
              />
            </label>
            <Button
              loading={create.isPending}
              disabled={!canSubmit}
              onClick={() => create.mutate()}
            >
              Опубликовать
            </Button>
          </div>
        </Card>
      )}

      {isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={80} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить объявления" />}
      {!isLoading && data?.length === 0 && <EmptyState title="Объявлений пока нет" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((a) => (
            <div key={a.id} className={styles.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className={styles.listItemTitle}>{a.title}</div>
              <div className={styles.listItemMeta}>
                {a.group.name} · {formatDate(a.createdAt)}
              </div>
              <p style={{ margin: '12px 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
