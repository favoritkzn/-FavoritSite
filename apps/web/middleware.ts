import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROLE_DASHBOARD_PATH, UserRole } from '@favorit/types';

const PUBLIC_PATHS = [
  '/',
  '/about',
  '/coaches',
  '/schedule',
  '/pricing',
  '/news',
  '/gallery',
  '/contacts',
  '/privacy',
  '/terms',
  '/shop',
  '/login',
  '/register',
  '/register/pending',
  '/forgot-password',
  '/reset-password',
];

function getRoleDashboardPath(role: string | undefined): string {
  if (role === UserRole.PARENT || role === UserRole.COACH || role === UserRole.ADMIN) {
    return ROLE_DASHBOARD_PATH[role];
  }
  return '/login';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/admin' || pathname === '/coach' || pathname === '/parent') {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/parent') && role !== 'PARENT' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/coach') && role !== 'COACH' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getRoleDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/parent/:path*', '/coach/:path*', '/admin/:path*'],
};
