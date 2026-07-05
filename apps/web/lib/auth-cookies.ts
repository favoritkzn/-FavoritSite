import type { NextResponse } from 'next/server';
import type { UserRole } from '@favorit/types';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const USER_ROLE_COOKIE = 'user_role';
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

const cookieOptions = {
  path: '/',
  maxAge: TOKEN_MAX_AGE,
  sameSite: 'lax' as const,
  httpOnly: false,
};

export function setAuthCookies(response: NextResponse, accessToken: string, role: UserRole) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions);
  response.cookies.set(USER_ROLE_COOKIE, role, cookieOptions);
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  response.cookies.set(USER_ROLE_COOKIE, '', { ...cookieOptions, maxAge: 0 });
}
