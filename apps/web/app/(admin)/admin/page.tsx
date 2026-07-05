import { redirect } from 'next/navigation';
import { ROLE_DASHBOARD_PATH, UserRole } from '@favorit/types';

export default function AdminIndexPage() {
  redirect(ROLE_DASHBOARD_PATH[UserRole.ADMIN]);
}
