'use client';

import { use, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import type { ApiResponse } from '@favorit/types';
import { Button, Card, EmptyState, Input, Skeleton } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { DashboardShell } from '@/components/DashboardShell';
import { apiDelete, apiGet, apiPatch, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
}

export default function AdminNewsEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState('');

  const { data: news, isLoading, isError } = useQuery({
    queryKey: ['news', id],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<NewsItem>>(`/news/${id}`);
      return res.data!;
    },
  });

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (news && !initialized) {
      setTitle(news.title);
      setSlug(news.slug);
      setExcerpt(news.excerpt ?? '');
      setContent(news.content);
      setCoverImage(news.coverImage ?? '');
      setIsPublished(news.isPublished);
      setInitialized(true);
    }
  }, [news, initialized]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiPatch(`/news/${id}`, { title, slug, excerpt: excerpt || undefined, content, coverImage: coverImage || undefined, isPublished }),
    onSuccess: () => router.push('/admin/news'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete(`/news/${id}`),
    onSuccess: () => router.push('/admin/news'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    saveMutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось сохранить'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Редактирование">
      <Link href="/admin/news" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      {isLoading && <Skeleton variant="rect" height={400} />}
      {isError && <EmptyState title="Новость не найдена" />}
      {news && (
        <>
          <h1 className={styles.pageTitle}>Редактирование</h1>
          <Card title={news.title}>
            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 640 }}>
              {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
              <Input label="Заголовок" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={saveMutation.isPending} />
              <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required disabled={saveMutation.isPending} />
              <Input label="Краткое описание" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} disabled={saveMutation.isPending} />
              <FileUpload
                label="Обложка"
                value={coverImage}
                onChange={setCoverImage}
                disabled={saveMutation.isPending}
              />
              <div>
                <label style={{ fontSize: 14, fontWeight: 500 }}>Текст</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                  disabled={saveMutation.isPending}
                  style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} disabled={saveMutation.isPending} />
                Опубликовано
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Button type="submit" loading={saveMutation.isPending}>Сохранить</Button>
                <Button
                  type="button"
                  variant="secondary"
                  loading={deleteMutation.isPending}
                  onClick={() => {
                    if (confirm('Удалить новость?')) deleteMutation.mutate();
                  }}
                >
                  Удалить
                </Button>
              </div>
            </form>
          </Card>
        </>
      )}
    </DashboardShell>
  );
}
