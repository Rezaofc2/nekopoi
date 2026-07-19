import { NextResponse } from 'next/server';
import { getLatest } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET() {
  const posts = await getLatest();
  return NextResponse.json(posts, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
