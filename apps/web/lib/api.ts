import type { ApiResponse } from '@favorit/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return getCookie('access_token') ?? localStorage.getItem('access_token');
}

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  let payload: unknown = null;

  if (isJson) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    if (response.status >= 500 && !payload) {
      throw new ApiError(
        'Сервер API недоступен. Запустите backend (порт 4000) и обновите страницу.',
        response.status,
        'API_UNAVAILABLE',
      );
    }

    const message =
      (payload as ApiResponse)?.error?.message ??
      (payload as { message?: string | string[] })?.message ??
      `Ошибка запроса (${response.status})`;
    const text = Array.isArray(message) ? message.join(', ') : String(message);
    const code = (payload as ApiResponse)?.error?.code;
    throw new ApiError(text, response.status, code);
  }

  return payload as T;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, auth = true, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Нет связи с сервером. Проверьте, что API запущен на порту 4000.',
      0,
      'NETWORK_ERROR',
    );
  }

  return parseResponse<T>(response);
}

export async function apiGet<T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
  return apiFetch<T>(path, { ...options, method: 'GET' });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>,
) {
  return apiFetch<T>(path, { ...options, method: 'POST', body });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>,
) {
  return apiFetch<T>(path, { ...options, method: 'PUT', body });
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: Omit<FetchOptions, 'method' | 'body'>,
) {
  return apiFetch<T>(path, { ...options, method: 'PATCH', body });
}

export async function apiDelete<T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
  return apiFetch<T>(path, { ...options, method: 'DELETE' });
}
