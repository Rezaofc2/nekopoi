'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Genre {
  name: string;
  slug: string;
}

export default function GenreListPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/genre-list')
      .then(r => r.json())
      .then(d => { setGenres(d || []); setLoading(false); })
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
          <h1 className="text-sm font-bold">Genre List</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-3 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : genres.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Tidak ada data genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {genres.map((g) => (
              <Link
                key={g.slug}
                href={"/post/" + g.slug}
                className="bg-[#16213e] border border-pink-500/10 hover:border-pink-400/40 rounded-lg p-3 text-center text-sm text-gray-300 hover:text-pink-300 transition"
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
