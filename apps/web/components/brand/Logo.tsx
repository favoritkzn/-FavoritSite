import styles from './Logo.module.css';

interface LogoProps {
  variant?: 'default' | 'compact' | 'hero';
  showTagline?: boolean;
}

/** Реальные пропорции обрезанного щита (632×693) */
const ASPECT = 632 / 693;

const HEIGHTS = {
  compact: 40,
  default: 48,
  hero: 280,
} as const;

export function Logo({ variant = 'default', showTagline = false }: LogoProps) {
  const h = HEIGHTS[variant === 'hero' ? 'hero' : variant === 'compact' ? 'compact' : 'default'];
  const w = Math.round(h * ASPECT);

  return (
    <div className={`${styles.logo} ${styles[variant]}`}>
      <div className={styles.mark}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png?v=2"
          alt="ФК Фаворит"
          width={w}
          height={h}
          className={styles.markImage}
          decoding="async"
        />
      </div>
      {variant !== 'compact' && variant !== 'hero' && (
        <div className={styles.text}>
          <span className={styles.name}>Фаворит</span>
          {showTagline && (
            <span className={styles.tagline}>Футбольная академия · Казань</span>
          )}
        </div>
      )}
    </div>
  );
}
