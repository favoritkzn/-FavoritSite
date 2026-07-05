'use client';

import Link from 'next/link';
import { UserRole } from '@favorit/types';
import { Card, Skeleton, StatCard } from '@favorit/ui';
import { Baby, Calendar, ClipboardCheck, CreditCard, ShoppingBag, Users } from 'lucide-react';
import { DashboardShell } from '@/components/DashboardShell';
import { AdminTrialAlert } from '@/components/admin/AdminTrialAlert';
import { AdminRecentTrials } from '@/components/admin/AdminRecentTrials';
import { useDashboard } from '@/hooks/useDashboard';
import type { AdminDashboardStats } from '@/hooks/useDashboard';
import { getGreeting } from '@/lib/auth';
import { useAuthUser } from '@/hooks/useAuthUser';
import styles from '@/styles/cabinet.module.css';

export default function AdminDashboardPage() {
  const { data: user } = useAuthUser();
  const { data: stats, isLoading } = useDashboard();
  const admin = stats as AdminDashboardStats | undefined;

  return (
    <DashboardShell role={UserRole.ADMIN} title="Главная">
      <h1 className={styles.pageTitle}>{getGreeting()}, {user?.firstName ?? 'Админ'}!</h1>
      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rect" height={100} />)}
        </div>
      ) : (
        <>
          <AdminTrialAlert count={admin?.trialRegistrations ?? 0} />
          <AdminRecentTrials />
          <div className={styles.grid}>
            <StatCard label="Дети" value={admin?.childrenCount ?? 0} icon={<Baby size={20} />} />
            <StatCard label="Родители" value={admin?.parentsCount ?? 0} icon={<Users size={20} />} />
            <StatCard label="Группы" value={admin?.groupsCount ?? 0} icon={<Users size={20} />} />
            <StatCard label="Абонементы" value={admin?.activeSubscriptions ?? 0} icon={<CreditCard size={20} />} />
            <StatCard label="Ожидают оплаты" value={admin?.pendingPayments ?? 0} icon={<CreditCard size={20} />} />
            <StatCard label="Кабинеты родителей" value={admin?.pendingRegistrations ?? 0} icon={<Users size={20} />} />
            <StatCard label="Тренировки" value={admin?.upcomingSessions ?? 0} icon={<Calendar size={20} />} />
            <Link href="/admin/trial">
              <StatCard label="Пробные занятия" value={admin?.trialRegistrations ?? 0} icon={<ClipboardCheck size={20} />} />
            </Link>
            <StatCard label="Заказы" value={admin?.recentOrders ?? 0} icon={<ShoppingBag size={20} />} />
          </div>
          <div className={styles.grid} style={{ marginTop: 24 }}>
            <Link href="/admin/coaches"><Card title="Тренеры" hoverable><p className={styles.listItemMeta}>Создание и управление аккаунтами</p></Card></Link>
            <Link href="/admin/children"><Card title="Дети" hoverable><p className={styles.listItemMeta}>Управление учениками</p></Card></Link>
            <Link href="/admin/trial"><Card title="Пробные занятия" hoverable><p className={styles.listItemMeta}>Заявки с формы на сайте — перезвонить и записать</p></Card></Link>
            <Link href="/admin/registrations"><Card title="Кабинеты родителей" hoverable><p className={styles.listItemMeta}>Подтверждение регистрации на сайте</p></Card></Link>
            <Link href="/admin/payments"><Card title="Финансы" hoverable><p className={styles.listItemMeta}>Платежи и абонементы</p></Card></Link>
            <Link href="/admin/statistics"><Card title="Аналитика" hoverable><p className={styles.listItemMeta}>Статистика академии</p></Card></Link>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
