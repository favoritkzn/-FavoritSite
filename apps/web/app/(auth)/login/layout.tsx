import type { ReactNode } from 'react';
import { AuthLayout } from '@/components/layouts/AuthLayout';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthLayout maxWidth="sm">{children}</AuthLayout>;
}
