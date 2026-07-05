'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Avatar, Badge, Button, EmptyState, Skeleton } from '@favorit/ui';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardShell } from '@/components/DashboardShell';
import { apiDelete, apiGet } from '@/lib/api';
import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface Coach {
  id: string;
  bio: string | null;
  experience: string | null;
  photo: string | null;
  isPublic: boolean;
  user: { firstName: string; lastName: string; email: string; status: string };
  groups: Array<{ group: { id: string; name: string } }>;
}

export default function AdminCoachesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['coaches'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Coach[]>>('/coaches');
      return res.data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/coaches/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coaches'] }),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Тренеры">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>Тренеры</h1>
        <Link href="/admin/coaches/new">
          <Button>
            <Plus size={18} style={{ marginRight: 8 }} />
            Добавить тренера
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className={styles.grid}>
          {[1, 2].map((i) => <Skeleton key={i} variant="rect" height={100} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить" />}
      {!isLoading && data?.length === 0 && (
        <EmptyState
          title="Тренеров пока нет"
          description="Создайте аккаунт тренера — он сможет вести группы, отмечать посещаемость и публиковать объявления."
          action={
            <Link href="/admin/coaches/new">
              <Button>Добавить первого тренера</Button>
            </Link>
          }
        />
      )}
      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((c) => (
            <div key={c.id} className={styles.listItem}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1 }}>
                <Avatar src={c.photo} name={fullName(c.user.firstName, c.user.lastName)} />
                <div style={{ flex: 1 }}>
                  <div className={styles.listItemTitle}>
                    <Link href={`/admin/coaches/${c.id}/edit`} style={{ color: 'var(--color-primary)' }}>
                      {fullName(c.user.firstName, c.user.lastName)}
                    </Link>
                  </div>
                  <div className={styles.listItemMeta}>{c.user.email}</div>
                  {c.experience && <div className={styles.listItemMeta}>Опыт: {c.experience}</div>}
                  {c.groups.length > 0 && (
                    <div className={styles.listItemMeta}>
                      Группы: {c.groups.map((g) => g.group.name).join(', ')}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <Badge variant={c.isPublic ? 'success' : 'default'}>
                      {c.isPublic ? 'На сайте' : 'Скрыт'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                loading={deleteMutation.isPending}
                onClick={() => {
                  if (confirm(`Удалить тренера ${c.user.firstName} ${c.user.lastName}? Аккаунт будет удалён.`)) {
                    deleteMutation.mutate(c.id);
                  }
                }}
              >
                <Trash2 size={16} style={{ marginRight: 6 }} />
                Удалить
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
