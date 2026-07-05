import type { ApiResponse } from '@favorit/types';

function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
  }
  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl?.startsWith('http')) {
    return publicUrl;
  }
  const serverBase = process.env.API_URL ?? 'http://localhost:4000';
  return `${serverBase.replace(/\/$/, '')}/api/v1`;
}

export async function fetchCms<T>(key: string): Promise<T | null> {
  try {
    const res = await fetch(`${getApiBase()}/cms/settings/${key}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiResponse<{ value: T }>;
    return json.data?.value ?? null;
  } catch {
    return null;
  }
}
