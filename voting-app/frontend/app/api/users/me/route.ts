import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest) {
  const res = await fetch(`${process.env.API_BASE_URL}${process.env.NEXT_PUBLIC_API_PREFIX}/users/me`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
