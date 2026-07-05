'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Button, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/public.module.css';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  publishedAt: string | null;
}

export default function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ['news', 'public', slug],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<NewsArticle>>(`/news/public/${slug}`, { auth: false });
      return res.data!;
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Skeleton variant="title" width="60%" />
        <Skeleton variant="rect" height={200} />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className={styles.container}>
        <EmptyState title="Статья не найдена" action={<Link href="/news"><Button>К новостям</Button></Link>} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{article.title}</h1>
      {article.publishedAt && (
        <p className={styles.subtitle}>{formatDate(article.publishedAt)}</p>
      )}
      {article.coverImage && (
        <img
          src={article.coverImage}
          alt=""
          style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 12, marginBottom: 24 }}
        />
      )}
      <div className={styles.prose} dangerouslySetInnerHTML={{ __html: article.content }} />
      <div style={{ marginTop: 32 }}>
        <Link href="/news"><Button variant="secondary">← Все новости</Button></Link>
      </div>
    </div>
  );
}
