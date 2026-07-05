import type { Metadata } from 'next';
import { ResetPasswordForm } from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Новый пароль',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
