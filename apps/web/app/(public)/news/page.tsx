'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@favorit/types';
import { Badge, EmptyState, Skeleton } from '@favorit/ui';
import { apiGet } from '@/lib/api';
import { formatDate } from '@/lib/format';
import styles from '@/styles/public.module.css';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

export default function NewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['news', 'public'],
    queryFn: async () => {
      const res = await apiGet<ApiResponse<NewsItem[]>>('/news/public', { auth: false });
      return res.data ?? [];
    },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Новости</h1>
      <p className={styles.subtitle}>События и достижения академии</p>

      {isLoading && (
        <div className={styles.grid}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rect" height={160} />
          ))}
        </div>
      )}

      {isError && <EmptyState title="Не удалось загрузить новости" />}

      {!isLoading && !isError && data?.length === 0 && (
        <EmptyState title="Новостей пока нет" />
      )}

      {data && data.length > 0 && (
        <div className={styles.grid}>
          {data.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`} className={styles.card}>
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt=""
                  style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                />
              ) : (
                <div style={{ fontSize: 48, marginBottom: 12 }}>📰</div>
              )}
              <h3 className={styles.cardTitle}>{item.title}</h3>
              {item.excerpt && <p className={styles.cardMeta}>{item.excerpt}</p>}
              {item.publishedAt && (
                <Badge variant="default" style={{ marginTop: 8 }}>
                  {formatDate(item.publishedAt)}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
