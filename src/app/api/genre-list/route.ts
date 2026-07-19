import { NextResponse } from 'next/server';
import { getGenreList } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET() {
  const genres = await getGenreList();
  return NextResponse.json(genres, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
