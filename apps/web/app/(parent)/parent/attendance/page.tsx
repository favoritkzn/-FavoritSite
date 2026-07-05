'use client';

import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, EmptyState, Skeleton } from '@favorit/ui';
import { ChildSwitcher } from '@/components/parent/ChildSwitcher';
import { DashboardShell } from '@/components/DashboardShell';
import { useDashboard } from '@/hooks/useDashboard';
import type { ParentDashboardStats } from '@/hooks/useDashboard';
import { useSelectedChild } from '@/hooks/useSelectedChild';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface AttendanceRecord {
  id: string;
  status: string;
  note: string | null;
  session: { startTime: string; title: string | null };
}

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Присутствовал',
  ABSENT: 'Отсутствовал',
  LATE: 'Опоздал',
  EXCUSED: 'Уважительная',
};

export default function ParentAttendancePage() {
  const { data: dash } = useDashboard();
  const children = (dash as ParentDashboardStats | undefined)?.children ?? [];
  const { childId, setChildId } = useSelectedChild(children);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance', childId],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<AttendanceRecord[]>>(`/attendance/children/${childId}/history`);
      return res.data ?? [];
    },
    enabled: !!childId,
  });

  return (
    <DashboardShell role={UserRole.PARENT} title="Посещаемость">
      <h1 className={styles.pageTitle}>Посещаемость</h1>
      {!children.length && <EmptyState title="Нет привязанных детей" />}
      {children.length > 0 && (
        <ChildSwitcher children={children} value={childId} onChange={setChildId} />
      )}
      {childId && isLoading && (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rect" height={60} />)}
        </div>
      )}
      {isError && <EmptyState title="Не удалось загрузить посещаемость" />}
      {data?.length === 0 && !isLoading && childId && <EmptyState title="Записей пока нет" />}
      {data && data.length > 0 && (
        <div className={styles.list}>
          {data.map((r) => (
            <div key={r.id} className={styles.listItem}>
              <div>
                <div className={styles.listItemTitle}>{r.session.title ?? 'Тренировка'}</div>
                <div className={styles.listItemMeta}>{formatDate(r.session.startTime)}</div>
              </div>
              <Badge variant={r.status === 'PRESENT' ? 'success' : r.status === 'ABSENT' ? 'error' : 'warning'}>
                {STATUS_LABELS[r.status] ?? r.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
