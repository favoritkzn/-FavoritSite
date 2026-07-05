'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';
import { RedCircles } from '@/components/brand/RedCircles';
import styles from './PublicLayout.module.css';

const NAV = [
  { href: '/about', label: 'О школе' },
  { href: '/coaches', label: 'Тренеры' },
  { href: '/schedule', label: 'Расписание' },
  { href: '/pricing', label: 'Стоимость' },
  { href: '/news', label: 'Новости' },
  { href: '/gallery', label: 'Галерея' },
  { href: '/shop', label: 'Магазин' },
];

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logoLink}>
            <Logo showTagline={false} />
          </Link>

          <nav className={styles.nav}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href || pathname.startsWith(`${item.href}/`) ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.headerActions}>
            <Link href="/contacts#trial-form" className={styles.trialBtn}>
              Начать
            </Link>
            <Link href="/login" className={styles.loginBtn}>
              Войти
            </Link>
            <button
              type="button"
              className={styles.menuBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
              <Link href="/contacts#trial-form" onClick={() => setMenuOpen(false)}>Начать заниматься</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}>Личный кабинет</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)}>Войти</Link>
          </div>
        )}
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <RedCircles variant="footer" />
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <Logo showTagline />
            <p className={styles.footerDesc}>
              Детская футбольная академия в Казани. Тренировки для детей 6–12 лет,
              небольшие группы и личный кабинет для родителей.
            </p>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Академия</h4>
            <div className={styles.footerLinks}>
              <Link href="/about">О школе</Link>
              <Link href="/coaches">Тренеры</Link>
              <Link href="/schedule">Расписание</Link>
              <Link href="/pricing">Стоимость</Link>
            </div>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Сервисы</h4>
            <div className={styles.footerLinks}>
              <Link href="/news">Новости</Link>
              <Link href="/gallery">Галерея</Link>
              <Link href="/shop">Магазин</Link>
              <Link href="/contacts#trial-form">Начать заниматься</Link>
              <Link href="/register">Личный кабинет</Link>
            </div>
          </div>
          <div>
            <h4 className={styles.footerHeading}>Контакты</h4>
            <div className={styles.footerLinks}>
              <span>г. Казань</span>
              <span>info@favorit-kzn.ru</span>
              <span>+7 (843) 000-00-00</span>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} ФК «Фаворит»</p>
          <div className={styles.footerLegal}>
            <Link href="/privacy">Конфиденциальность</Link>
            <Link href="/terms">Соглашение</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
