'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe, type AuthUser } from '@/lib/auth';

export function useAuthUser() {
  return useQuery<AuthUser>({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
