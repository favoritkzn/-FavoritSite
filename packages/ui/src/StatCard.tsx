import type { ReactNode } from 'react';
import { cn } from './lib/cn';
import styles from './StatCard.module.css';

export interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
}

export function StatCard({ label, value, trend, trendDirection = 'neutral', icon }: StatCardProps) {
  return (
    <div className={styles.card}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.label}>{label}</div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {trend && (
          <span
            className={cn(
              styles.trend,
              trendDirection === 'up' && styles.trendUp,
              trendDirection === 'down' && styles.trendDown,
              trendDirection === 'neutral' && styles.trendNeutral,
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
