/**
 * Design tokens — docs/UI_GUIDELINES.md
 * Primary: modern sports red (NOT green)
 */
export const colors = {
  primary: '#E11D2E',
  primaryHover: '#C41928',
  primaryLight: '#FEE2E2',
  primarySubtle: '#FFF5F5',
  accent: '#F5C518',
  navy: '#0B1B3A',
  white: '#FFFFFF',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  borderSubtle: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 1px 3px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
} as const;

export const typography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const;

export { cn } from './lib/cn';
