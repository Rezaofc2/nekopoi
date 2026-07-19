'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RandomPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/random')
      .then(r => r.json())
      .then(d => {
        if (d.slug) router.push('/post/' + d.slug);
        else router.push('/');
      })
      .catch(() => router.push('/'));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
    </div>
  );
}