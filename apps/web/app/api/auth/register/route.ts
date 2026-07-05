import { NextResponse } from 'next/server';
import type { ApiResponse, RegisterDto } from '@favorit/types';
import { SERVER_API_URL } from '@/lib/server-api';

interface RegisterPayload {
  pending: true;
  message: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterDto;

  const upstream = await fetch(`${SERVER_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = (await upstream.json()) as ApiResponse<RegisterPayload>;

  if (!upstream.ok || !payload.data) {
    return NextResponse.json(payload, { status: upstream.status });
  }

  return NextResponse.json(payload);
}
