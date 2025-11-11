import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const n = searchParams.get('n') ?? '200';
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
  try {
    const res = await fetch(`${base}/last?n=${n}`, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Upstream responded with an error', status: res.status },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to reach upstream API', details: errorMessage },
      { status: 502 }
    );
  }
}
