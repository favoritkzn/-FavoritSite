import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md';
}

export function AuthLayout({ children, maxWidth = 'sm' }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <Link href="/" className={styles.back}>
        ← Назад на главную
      </Link>
      <div
        className={styles.card}
        style={{ maxWidth: maxWidth === 'md' ? 480 : 420 }}
      >
        <Link href="/" className={styles.logo}>
          <Logo variant="compact" showTagline={false} />
        </Link>
        {children}
      </div>
    </div>
  );
}
