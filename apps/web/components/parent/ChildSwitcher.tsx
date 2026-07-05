'use client';

import { fullName } from '@/lib/format';
import styles from '@/styles/cabinet.module.css';

interface ChildOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface ChildSwitcherProps {
  children: ChildOption[];
  value: string;
  onChange: (childId: string) => void;
}

export function ChildSwitcher({ children, value, onChange }: ChildSwitcherProps) {
  if (children.length <= 1) {
    const child = children[0];
    if (!child) return null;
    return (
      <p className={styles.listItemMeta} style={{ marginBottom: 16 }}>
        {fullName(child.firstName, child.lastName)}
      </p>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 14, fontWeight: 500, display: 'block', marginBottom: 6 }}>
        Ребёнок
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: 10,
          borderRadius: 8,
          border: '1px solid var(--color-border)',
        }}
      >
        {children.map((child) => (
          <option key={child.id} value={child.id}>
            {fullName(child.firstName, child.lastName)}
          </option>
        ))}
      </select>
    </div>
  );
}
