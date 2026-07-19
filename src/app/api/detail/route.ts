import { NextRequest, NextResponse } from 'next/server';
import { getDetail } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  if (!slug) return NextResponse.json(null, { status: 400 });
  const data = await getDetail(slug);
  if (!data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=3600' },
  });
}
