import { NextResponse } from 'next/server';
import { getJavList } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET() {
  const items = await getJavList();
  return NextResponse.json(items, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
