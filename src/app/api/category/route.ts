import { NextRequest, NextResponse } from 'next/server';
import { getCategoryPage } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const cat = req.nextUrl.searchParams.get('cat') || '';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1') || 1;
  if (!cat) return NextResponse.json([]);
  const posts = await getCategoryPage(cat, page);
  return NextResponse.json(posts, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  });
}
