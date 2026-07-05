'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Badge, Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiGet, apiPatch, apiPost } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface MediaItem {
  id: string;
  url: string;
  title: string | null;
  type: string;
}

interface Album {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  items: MediaItem[];
}

export default function AdminAlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [uploadError, setUploadError] = useState('');

  const { data: album, isLoading, isError } = useQuery({
    queryKey: ['media', 'albums', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<Album>>(`/media/albums/${id}`);
      return res.data!;
    },
  });

  const addMutation = useMutation({
    mutationFn: (url: string) =>
      apiPost(`/media/albums/${id}/items`, { url, title: title || undefined, type: 'IMAGE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', 'albums', id] });
      setTitle('');
      setUploadError('');
    },
    onError: () => setUploadError('Не удалось добавить фото в альбом'),
  });

  const togglePublicMutation = useMutation({
    mutationFn: (isPublic: boolean) => apiPatch(`/media/albums/${id}`, { isPublic }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['media', 'albums', id] }),
  });

  return (
    <DashboardShell role={UserRole.ADMIN} title="Альбом">
      <Link href="/admin/media" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К медиа</Link>
      {isLoading && <Skeleton variant="rect" height={300} />}
      {isError && <EmptyState title="Альбом не найден" />}
      {album && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
            <h1 className={styles.pageTitle} style={{ marginBottom: 0 }}>{album.title}</h1>
            <Badge variant={album.isPublic ? 'success' : 'default'}>
              {album.isPublic ? 'Публичный' : 'Скрытый'}
            </Badge>
          </div>
          {album.description && <p className={styles.listItemMeta}>{album.description}</p>}

          <Button
            variant="secondary"
            size="sm"
            style={{ marginTop: 12 }}
            loading={togglePublicMutation.isPending}
            onClick={() => togglePublicMutation.mutate(!album.isPublic)}
          >
            {album.isPublic ? 'Скрыть' : 'Опубликовать'}
          </Button>

          <Card title="Добавить фото" style={{ marginTop: 24 }}>
            <div className={styles.form} style={{ marginTop: 12, maxWidth: 520 }}>
              <Input
                label="Подпись (необязательно)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={addMutation.isPending}
              />
              <FileUpload
                label="Фото"
                value=""
                onChange={() => {}}
                showUrlInput={false}
                disabled={addMutation.isPending}
                hint="Загрузите с компьютера или сделайте фото на телефоне — оно сразу добавится в альбом"
                onUploadComplete={(url) => addMutation.mutate(url)}
              />
              {addMutation.isPending && (
                <p className={styles.listItemMeta}>Добавляем в альбом…</p>
              )}
              {uploadError && <p style={{ color: 'var(--color-error)', fontSize: 13 }}>{uploadError}</p>}
            </div>
          </Card>

          <Card title={`Фото (${album.items.length})`} style={{ marginTop: 24 }}>
            {album.items.length === 0 ? (
              <EmptyState title="Нет фото" />
            ) : (
              <div className={styles.grid} style={{ marginTop: 12 }}>
                {album.items.map((item) => (
                  <div key={item.id} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img src={item.url} alt={item.title ?? ''} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                    {item.title && <p style={{ padding: 8, fontSize: 13, margin: 0 }}>{item.title}</p>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
