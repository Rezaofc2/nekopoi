import { NextRequest, NextResponse } from 'next/server';
import { getLatest } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1') || 1;
  const posts = await getLatest(page);
  return NextResponse.json(posts, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  });
}
