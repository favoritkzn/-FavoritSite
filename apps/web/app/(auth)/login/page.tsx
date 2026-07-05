import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Вход',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: 40 }}>Загрузка...</div>}>
      <LoginForm />
    </Suspense>
  );
}
