import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from './lib/cn';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  title?: string;
  description?: string;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Card({
  padding = 'md',
  hoverable = false,
  title,
  description,
  footer,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        padding === 'none' && styles.paddingNone,
        padding === 'sm' && styles.paddingSm,
        padding === 'md' && styles.paddingMd,
        padding === 'lg' && styles.paddingLg,
        hoverable && styles.hoverable,
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      )}
      {children}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
