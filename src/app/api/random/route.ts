import { NextResponse } from 'next/server';
import { getLatest } from '@/lib/nekopoi';

export const runtime = 'nodejs';

export async function GET() {
  const posts = await getLatest(Math.floor(Math.random() * 5) + 1);
  if (!posts.length) return NextResponse.redirect(new URL('/', 'https://nekopoi.care'));
  const random = posts[Math.floor(Math.random() * posts.length)];
  return NextResponse.json({ slug: random.slug });
}