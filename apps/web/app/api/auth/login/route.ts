import { NextResponse } from 'next/server';
import type { ApiResponse, LoginDto, UserRole } from '@favorit/types';
import { setAuthCookies } from '@/lib/auth-cookies';
import { SERVER_API_URL } from '@/lib/server-api';

interface AuthPayload {
  user: { role: UserRole };
  accessToken: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as LoginDto;

  const upstream = await fetch(`${SERVER_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await upstream.json()) as ApiResponse<AuthPayload>;

  if (!upstream.ok || !payload.data) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  const response = NextResponse.json(payload);
  setAuthCookies(response, payload.data.accessToken, payload.data.user.role);
  return response;
}
