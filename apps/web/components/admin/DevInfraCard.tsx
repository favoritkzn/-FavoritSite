'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Badge, Card } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface InfraStatus {
  postgres: 'ok' | 'error';
  redis: 'ok' | 'down' | 'not_used';
  minio: 'ok' | 'down' | 'disabled';
  uploads: 'minio' | 'local';
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ok' || status === 'minio') {
    return <Badge variant="success">Работает</Badge>;
  }
  if (status === 'not_used' || status === 'disabled' || status === 'local') {
    return <Badge variant="default">Не используется</Badge>;
  }
  return <Badge variant="warning">Недоступен</Badge>;
}

export function DevInfraCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health', 'infra'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<InfraStatus>>('/health/infra', { auth: false });
      return res.data;
    },
    refetchInterval: 30_000,
  });

  return (
    <Card title="Инфраструктура (Docker)" style={{ marginTop: 24 }}>
      <p className={styles.listItemMeta} style={{ marginTop: 8, marginBottom: 16 }}>
        Локальные сервисы для разработки. Запуск: <code>pnpm docker:up</code>
      </p>

      {isLoading && <p className={styles.listItemMeta}>Проверяем…</p>}
      {isError && (
        <p style={{ color: 'var(--color-error)', fontSize: 14 }}>
          Не удалось проверить. Запустите API и Docker.
        </p>
      )}

      {data && (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>PostgreSQL</span>
            <StatusBadge status={data.postgres} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>Redis</span>
            <StatusBadge status={data.redis} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>MinIO (фото и файлы)</span>
            <StatusBadge status={data.minio} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>Загрузка файлов</span>
            <Badge variant={data.uploads === 'minio' ? 'success' : 'default'}>
              {data.uploads === 'minio' ? 'MinIO' : 'Локальная папка'}
            </Badge>
          </div>
        </div>
      )}

      <div className={styles.listItemMeta} style={{ marginTop: 16, lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 8px' }}>
          <a href="http://localhost:9001" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
            MinIO консоль
          </a>
          {' '}· minioadmin / minioadmin
        </p>
        <p style={{ margin: 0 }}>
          Если MinIO недоступен: <code>pnpm docker:up</code>, затем перезапустите API.
        </p>
      </div>
    </Card>
  );
}
