import { NextResponse } from 'next/server';
import { getJadwalHentai } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET() {
  const content = await getJadwalHentai();
  return NextResponse.json({ content }, {
    headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
  });
}
