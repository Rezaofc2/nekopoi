'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function JadwalPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jadwal')
      .then(r => r.json())
      .then(d => { setContent(d.content || ''); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <header className="sticky top-0 z-40 bg-[#1a1a2e]/95 backdrop-blur border-b border-pink-500/20">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
          <Link href="/" className="text-pink-400 hover:text-pink-300 flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-sm font-bold">Jadwal New Hentai</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : !content ? (
          <div className="text-center py-20 text-gray-500">
            <p>Tidak ada jadwal.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] rounded-xl p-6 border border-pink-500/10 prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </main>
    </div>
  );
}
