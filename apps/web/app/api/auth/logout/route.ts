import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-cookies';
import { SERVER_API_URL } from '@/lib/server-api';

export async function POST(request: Request) {
  try {
    await fetch(`${SERVER_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        cookie: request.headers.get('cookie') ?? '',
      },
    });
  } catch {
    // Clear local session even if upstream logout fails.
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
