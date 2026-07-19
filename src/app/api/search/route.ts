import { NextRequest, NextResponse } from 'next/server';
import { searchNekopoi } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q.trim()) return NextResponse.json([]);
  const posts = await searchNekopoi(q);
  return NextResponse.json(posts, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  });
}
