import {
  type ApiResponse,
  type LoginDto,
  type RegisterDto,
  UserRole,
  ROLE_DASHBOARD_PATH,
} from '@favorit/types';
import { ApiError, apiGet } from './api';

const ACCESS_TOKEN_KEY = 'access_token';
const USER_ROLE_KEY = 'user_role';
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
}

interface AuthPayload {
  user: AuthUser;
  accessToken: string;
}

function setCookie(name: string, value: string, maxAge = TOKEN_MAX_AGE) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

export function setAuthSession(accessToken: string, role: UserRole) {
  setCookie(ACCESS_TOKEN_KEY, accessToken);
  setCookie(USER_ROLE_KEY, role);
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(USER_ROLE_KEY, role);
}

export function clearAuthSession() {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(USER_ROLE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
}

export function getStoredRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )user_role=([^;]*)/);
  const fromCookie = match ? decodeURIComponent(match[1]) : null;
  const role = fromCookie ?? localStorage.getItem(USER_ROLE_KEY);
  if (role === UserRole.PARENT || role === UserRole.COACH || role === UserRole.ADMIN) {
    return role;
  }
  return null;
}

export function getDashboardPath(role: UserRole): string {
  return ROLE_DASHBOARD_PATH[role];
}

export function resolvePostLoginPath(redirect: string | null, role: UserRole): string {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return getDashboardPath(role);
  }

  if (redirect === '/admin' || redirect === '/coach' || redirect === '/parent') {
    return getDashboardPath(role);
  }

  return redirect;
}

async function parseAuthResponse(response: Response): Promise<AuthPayload> {
  const payload = (await response.json()) as ApiResponse<AuthPayload>;
  if (!response.ok || !payload.data) {
    const message =
      payload.error?.message ??
      (payload as { message?: string | string[] }).message ??
      `Ошибка запроса (${response.status})`;
    const text = Array.isArray(message) ? message.join(', ') : String(message);
    throw new ApiError(text, response.status, payload.error?.code);
  }
  return payload.data;
}

export async function login(dto: LoginDto): Promise<AuthUser> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
    credentials: 'include',
  });
  const data = await parseAuthResponse(response);
  setAuthSession(data.accessToken, data.user.role);
  return data.user;
}

export async function register(dto: RegisterDto): Promise<{ pending: true; message: string }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
    credentials: 'include',
  });
  const payload = (await response.json()) as ApiResponse<{ pending: true; message: string }>;
  if (!response.ok || !payload.data) {
    const message =
      payload.error?.message ??
      (payload as { message?: string | string[] }).message ??
      `Ошибка запроса (${response.status})`;
    const text = Array.isArray(message) ? message.join(', ') : String(message);
    throw new ApiError(text, response.status, payload.error?.code);
  }
  return payload.data;
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } finally {
    clearAuthSession();
  }
}

export async function getMe(): Promise<AuthUser> {
  const response = await apiGet<ApiResponse<AuthUser>>('/auth/me');
  return response.data!;
}

export function getFullName(user: Pick<AuthUser, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Доброе утро';
  if (hour >= 12 && hour < 18) return 'Добрый день';
  if (hour >= 18 && hour < 23) return 'Добрый вечер';
  return 'Доброй ночи';
}
