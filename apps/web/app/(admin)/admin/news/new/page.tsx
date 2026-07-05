'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { UserRole } from '@favorit/types';
import { Button, Card, Input } from '@favorit/ui';
import { FileUpload } from '@/components/admin/FileUpload';
import { MarkdownPreview } from '@/components/admin/MarkdownPreview';
import { DashboardShell } from '@/components/DashboardShell';
import { apiPost, ApiError } from '@/lib/api';
import styles from '@/styles/cabinet.module.css';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (c) => {
      const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
        и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
        с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
        ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
      };
      return map[c] ?? c;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function AdminNewsNewPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      apiPost('/news', {
        title,
        slug: slug || slugify(title),
        excerpt: excerpt || undefined,
        content,
        coverImage: coverImage || undefined,
        isPublished,
      }),
    onSuccess: () => router.push('/admin/news'),
  });

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugManual) setSlug(slugify(value));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!content.trim()) {
      setError('Введите текст новости');
      return;
    }
    mutation.mutate(undefined, {
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Не удалось создать'),
    });
  }

  return (
    <DashboardShell role={UserRole.ADMIN} title="Новая новость">
      <Link href="/admin/news" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← К списку</Link>
      <h1 className={styles.pageTitle}>Новая новость</h1>

      <Card title="Содержание">
        <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: 16, maxWidth: 640 }}>
          {error && <p style={{ color: 'var(--color-error)', fontSize: 14 }}>{error}</p>}
          <Input label="Заголовок" value={title} onChange={(e) => handleTitleChange(e.target.value)} required disabled={mutation.isPending} />
          <Input
            label="URL (slug)"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
            required
            disabled={mutation.isPending}
          />
          <Input label="Краткое описание" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} disabled={mutation.isPending} />
          <FileUpload
            label="Обложка"
            value={coverImage}
            onChange={setCoverImage}
            disabled={mutation.isPending}
          />
          <div>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Текст (Markdown: **жирный**, ## заголовок)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              required
              disabled={mutation.isPending}
              style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }}
            />
            {content.trim() && <MarkdownPreview content={content} />}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} disabled={mutation.isPending} />
            Опубликовать сразу
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="submit" loading={mutation.isPending}>Сохранить</Button>
            <Link href="/admin/news"><Button type="button" variant="secondary">Отмена</Button></Link>
          </div>
        </form>
      </Card>
    </DashboardShell>
  );
}
