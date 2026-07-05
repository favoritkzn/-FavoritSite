import type { Metadata } from 'next';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Личный кабинет — регистрация',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
