import type { ReactNode } from 'react';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <AuthLayout maxWidth="md">{children}</AuthLayout>;
}
