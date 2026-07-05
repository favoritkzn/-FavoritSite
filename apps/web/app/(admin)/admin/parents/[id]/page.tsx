'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiDelete, apiGet, apiPost } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Parent {
  id: string;
  address: string | null;
  user: { firstName: string; lastName: string; email: string; phone: string | null };
  children: Array<{ child: { id: string; firstName: string; lastName: string }; relation: string }>;
}

interface ChildOption {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AdminParentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [childId, setChildId] = useState('');
  const [relation, setRelation] = useState<'MOTHER' | 'FATHER' | 'GUARDIAN' | 'OTHER'>('GUARDIAN');

  const { data: parent, isLoading, isError } = useQuery({
    queryKey: ['parents', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Parent>>(`/parents/${id}`);
      return res.data!;
    },
  });

  const { data: children } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<ChildOption[]>>('/children');
      return res.data ?? [];
    },
  });

  const linkMutation = useMutation({
    mutationFn: () => apiPost(`/parents/${id}/children`, { childId, relation }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents', id] });
      setChildId('');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (cid: string) => apiDelete(`/parents/${id}/children/${cid}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parents', id] }),
  });

  const linkedIds = new Set(parent?.children.map((c) => c.child.id) ?? []);
  const available = children?.filter((c) => !linkedIds.has(c.id)) ?? [];

  const RELATION_LABELS: Record<string, string> = {
    MOTHER: 'Мать', FATHER: 'Отец', GUARDIAN: 'Опекун', OTHER: 'Другое',
  };

  return (
    <DashboardShell role={UserRole.ADMIN} title="Родитель">
      <Link href="/admin/parents" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      {isLoading && <Skeleton variant="rect" height={300} />}
      {isError && <EmptyState title="Не найден" />}
      {parent && (
        <>
          <h1 className={styles.pageTitle} style={{ marginTop: 16 }}>
            {fullName(parent.user.firstName, parent.user.lastName)}
          </h1>
          <p className={styles.listItemMeta}>{parent.user.email} · {parent.user.phone ?? '—'}</p>

          <Card title="Дети" style={{ marginTop: 24 }}>
            {parent.children.length === 0 ? (
              <EmptyState title="Нет привязанных детей" />
            ) : (
              <div className={styles.list} style={{ marginTop: 12 }}>
                {parent.children.map(({ child, relation: rel }) => (
                  <div key={child.id} className={styles.listItem}>
                    <div>
                      <Link href={`/admin/children/${child.id}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        {fullName(child.firstName, child.lastName)}
                      </Link>
                      <div className={styles.listItemMeta}>{RELATION_LABELS[rel] ?? rel}</div>
                    </div>
                    <Button size="sm" variant="secondary" loading={unlinkMutation.isPending} onClick={() => unlinkMutation.mutate(child.id)}>
                      Отвязать
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {available.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Ребёнок</label>
                  <select value={childId} onChange={(e) => setChildId(e.target.value)} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <option value="">Выберите...</option>
                    {available.map((c) => <option key={c.id} value={c.id}>{fullName(c.firstName, c.lastName)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 14, fontWeight: 500 }}>Связь</label>
                  <select value={relation} onChange={(e) => setRelation(e.target.value as typeof relation)} style={{ display: 'block', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}>
                    <option value="MOTHER">Мать</option>
                    <option value="FATHER">Отец</option>
                    <option value="GUARDIAN">Опекун</option>
                    <option value="OTHER">Другое</option>
                  </select>
                </div>
                <Button disabled={!childId} loading={linkMutation.isPending} onClick={() => linkMutation.mutate()}>Привязать</Button>
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
