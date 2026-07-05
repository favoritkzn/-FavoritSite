'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { DashboardShell } from '@/components/DashboardShell';
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Group {
  id: string;
  name: string;
  ageCategory: string;
  description: string | null;
  maxCapacity: number | null;
  isActive: boolean;
  children: Array<{ child: { id: string; firstName: string; lastName: string } }>;
}

interface ChildOption {
  id: string;
  firstName: string;
  lastName: string;
}

export default function AdminGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [addChildId, setAddChildId] = useState('');

  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Group>>(`/groups/${id}`);
      return res.data!;
    },
  });

  const { data: allChildren } = useQuery({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<ChildOption[]>>('/children');
      return res.data ?? [];
    },
  });

  const [name, setName] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (group && !initialized) {
      setName(group.name);
      setAgeCategory(group.ageCategory);
      setDescription(group.description ?? '');
      setIsActive(group.isActive);
      setInitialized(true);
    }
  }, [group, initialized]);

  const saveMutation = useMutation({
    mutationFn: () => apiPatch(`/groups/${id}`, { name, ageCategory, description: description || undefined, isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', id] }),
  });

  const addChildMutation = useMutation({
    mutationFn: (childId: string) => apiPost(`/groups/${id}/children`, { childId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', id] });
      setAddChildId('');
    },
  });

  const removeChildMutation = useMutation({
    mutationFn: (childId: string) => apiDelete(`/groups/${id}/children/${childId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups', id] }),
  });

  const rosterIds = new Set(group?.children.map((c) => c.child.id) ?? []);
  const availableChildren = allChildren?.filter((c) => !rosterIds.has(c.id)) ?? [];

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setError('');
    saveMutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Ошибка сохранения'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Группа">
      <Link href="/admin/groups" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      {isLoading && <Skeleton variant="rect" height={400} />}
      {isError && <EmptyState title="Группа не найдена" />}
      {group && (
        <>
          <h1 className={styles.pageTitle}>{group.name}</h1>
          <Badge variant={group.isActive ? 'success' : 'default'}>{group.isActive ? 'Активна' : 'Неактивна'}</Badge>

          <Card title="Параметры" style={{ marginTop: 24 }}>
            <form className={styles.form} onSubmit={handleSave} style={{ marginTop: 16, maxWidth: 480 }}>
              {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
              <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Возраст" value={ageCategory} onChange={(e) => setAgeCategory(e.target.value)} required />
              <Input label="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Активна
              </label>
              <Button type="submit" loading={saveMutation.isPending}>Сохранить</Button>
            </form>
          </Card>

          <Card title={`Состав (${group.children.length})`} style={{ marginTop: 24 }}>
            {group.children.length === 0 ? (
              <EmptyState title="Нет учеников" />
            ) : (
              <div className={styles.list} style={{ marginTop: 12 }}>
                {group.children.map(({ child }) => (
                  <div key={child.id} className={styles.listItem}>
                    <Link href={`/admin/children/${child.id}`} style={{ color: 'var(--color-primary)' }}>
                      {fullName(child.firstName, child.lastName)}
                    </Link>
                    <Button size="sm" variant="secondary" loading={removeChildMutation.isPending} onClick={() => removeChildMutation.mutate(child.id)}>
                      Убрать
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {availableChildren.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <select
                  value={addChildId}
                  onChange={(e) => setAddChildId(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
                >
                  <option value="">Добавить ученика...</option>
                  {availableChildren.map((c) => (
                    <option key={c.id} value={c.id}>{fullName(c.firstName, c.lastName)}</option>
                  ))}
                </select>
                <Button disabled={!addChildId} loading={addChildMutation.isPending} onClick={() => addChildMutation.mutate(addChildId)}>
                  Добавить
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
