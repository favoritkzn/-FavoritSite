import type { HTMLAttributes } from 'react';
import { cn } from './lib/cn';
import styles from './Avatar.module.css';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({ src, alt, name = '', size = 'md', className, ...props }: AvatarProps) {
  return (
    <div className={cn(styles.avatar, styles[size], className)} {...props}>
      {src ? (
        <img src={src} alt={alt ?? name} className={styles.image} />
      ) : (
        <span aria-hidden>{getInitials(name || '?')}</span>
      )}
    </div>
  );
}
