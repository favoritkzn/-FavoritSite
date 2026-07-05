import type { HTMLAttributes } from 'react';
import { cn } from './lib/cn';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'title' | 'avatar' | 'rect';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height, ...style }}
      aria-hidden
      {...props}
    />
  );
}
