'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { UserRole } from '@favorit/types';
import { Avatar } from '@favorit/ui';
import { Logo } from '@/components/brand/Logo';
import { logout } from '@/lib/auth';
import {
  LogOut,
  Bell,
  Calendar,
  CreditCard,
  Home,
  Settings,
  UserCircle,
  ClipboardCheck,
  UsersRound,
  Baby,
  DollarSign,
  ShoppingBag,
  Swords,
  Newspaper,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import styles from './DashboardLayout.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  [UserRole.PARENT]: [
    { href: '/parent/dashboard', label: 'Главная', icon: Home },
    { href: '/parent/children', label: 'Дети', icon: UserCircle },
    { href: '/parent/schedule', label: 'Расписание', icon: Calendar },
    { href: '/parent/attendance', label: 'Посещаемость', icon: ClipboardCheck },
    { href: '/parent/subscription', label: 'Абонемент', icon: CreditCard },
    { href: '/parent/announcements', label: 'Объявления', icon: Newspaper },
    { href: '/parent/payments', label: 'Оплата', icon: DollarSign },
    { href: '/parent/shop/orders', label: 'Магазин', icon: ShoppingBag },
    { href: '/parent/notifications', label: 'Уведомления', icon: Bell },
    { href: '/parent/settings', label: 'Настройки', icon: Settings },
  ],
  [UserRole.COACH]: [
    { href: '/coach/dashboard', label: 'Главная', icon: Home },
    { href: '/coach/schedule', label: 'Расписание', icon: Calendar },
    { href: '/coach/calendar', label: 'Календарь', icon: Calendar },
    { href: '/coach/groups', label: 'Группы', icon: UsersRound },
    { href: '/coach/attendance', label: 'Посещаемость', icon: ClipboardCheck },
    { href: '/coach/matches', label: 'Матчи', icon: Swords },
    { href: '/coach/announcements', label: 'Объявления', icon: Newspaper },
    { href: '/coach/media', label: 'Медиа', icon: Baby },
    { href: '/coach/notifications', label: 'Уведомления', icon: Bell },
    { href: '/coach/settings', label: 'Настройки', icon: Settings },
  ],
  [UserRole.ADMIN]: [
    { href: '/admin/dashboard', label: 'Главная', icon: Home },
    { href: '/admin/trial', label: 'Пробные занятия', icon: ClipboardCheck },
    { href: '/admin/registrations', label: 'Кабинеты родителей', icon: UsersRound },
    { href: '/admin/coaches', label: 'Тренеры', icon: UserCircle },
    { href: '/admin/parents', label: 'Родители', icon: UsersRound },
    { href: '/admin/children', label: 'Дети', icon: Baby },
    { href: '/admin/groups', label: 'Группы', icon: UsersRound },
    { href: '/admin/schedule', label: 'Расписание', icon: Calendar },
    { href: '/admin/subscriptions', label: 'Абонементы', icon: CreditCard },
    { href: '/admin/news', label: 'Новости', icon: Newspaper },
    { href: '/admin/media', label: 'Медиа', icon: Baby },
    { href: '/admin/shop/products', label: 'Магазин', icon: ShoppingBag },
    { href: '/admin/payments', label: 'Финансы', icon: DollarSign },
    { href: '/admin/notifications', label: 'Уведомления', icon: Bell },
    { href: '/admin/statistics', label: 'Аналитика', icon: BarChart3 },
    { href: '/admin/settings', label: 'Настройки', icon: Settings },
    { href: '/admin/cms', label: 'Контент', icon: Newspaper },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.PARENT]: 'Родитель',
  [UserRole.COACH]: 'Тренер',
  [UserRole.ADMIN]: 'Администратор',
};

const ROLE_SLUG: Record<UserRole, string> = {
  [UserRole.PARENT]: 'parent',
  [UserRole.COACH]: 'coach',
  [UserRole.ADMIN]: 'admin',
};

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
  userName?: string;
  userAvatar?: string | null;
  notificationCount?: number;
  trialCount?: number;
  pendingRegistrationsCount?: number;
  title?: string;
}

export function DashboardLayout({
  children,
  role,
  userName = 'Пользователь',
  userAvatar,
  notificationCount = 0,
  trialCount = 0,
  pendingRegistrationsCount = 0,
  title = 'Личный кабинет',
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_BY_ROLE[role].map((item) => {
    if (role === UserRole.ADMIN && item.href === '/admin/trial' && trialCount > 0) {
      return { ...item, badge: trialCount };
    }
    if (role === UserRole.ADMIN && item.href === '/admin/registrations' && pendingRegistrationsCount > 0) {
      return { ...item, badge: pendingRegistrationsCount };
    }
    return item;
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.sidebarLogo}>
          <Logo variant="compact" />
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                <Icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={styles.navBadge}>{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.roleLabel}>{ROLE_LABELS[role]}</span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            Выйти
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.mobileTitle}>{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {role !== UserRole.COACH && (
              <Link href={`/${ROLE_SLUG[role] ?? 'parent'}/notifications`} className={styles.notificationBtn}>
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
            )}
            <div className={styles.userMenu}>
              <Avatar src={userAvatar} name={userName} size="sm" />
              <span className={styles.userName}>{userName}</span>
            </div>
          </div>
        </header>

        <main className={styles.content}>{children}</main>

        <nav className={styles.bottomNav} aria-label="Мобильная навигация">
          {(role === UserRole.ADMIN
            ? [
                NAV_BY_ROLE[UserRole.ADMIN][0],
                NAV_BY_ROLE[UserRole.ADMIN][1],
                NAV_BY_ROLE[UserRole.ADMIN][2],
                NAV_BY_ROLE[UserRole.ADMIN][6],
                NAV_BY_ROLE[UserRole.ADMIN][12],
              ]
            : navItems.slice(0, 5)
          ).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const badge =
              role === UserRole.ADMIN && item.href === '/admin/trial'
                ? trialCount
                : role === UserRole.ADMIN && item.href === '/admin/registrations'
                  ? pendingRegistrationsCount
                  : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.bottomNavLink} ${active ? styles.bottomNavLinkActive : ''}`}
              >
                <span className={styles.bottomNavIconWrap}>
                  <Icon className={styles.bottomNavIcon} />
                  {badge > 0 && <span className={styles.bottomNavBadge}>{badge > 9 ? '9+' : badge}</span>}
                </span>
                <span className={styles.bottomNavLabel}>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
