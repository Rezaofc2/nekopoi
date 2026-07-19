'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PostItem {
  title: string;
  slug: string;
  thumbnail: string;
  date: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchLatest = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await fetch('/api/latest');
      const data = await res.json();
      setPosts(data || []);
      setFetched(true);
    } catch {}
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-400 text-xs font-medium">
            🔞 NSFW Content — 18+
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="text-pink-400">Neko</span>
            <span className="text-white">Poi</span>
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto">
            Koleksi JAV, Hentai, dan Uncensored Subtitle Indonesia.
          </p>
          <button
            onClick={fetchLatest}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white text-sm font-medium rounded-xl hover:bg-pink-700 disabled:opacity-50 transition"
          >
            {loading ? 'Memuat...' : 'Buka Koleksi →'}
          </button>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                <div className="aspect-[2/3] bg-neutral-700" />
                <div className="p-2 space-y-2">
                  <div className="h-3 bg-neutral-700 rounded w-full" />
                  <div className="h-2 bg-neutral-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!fetched && !loading && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg">Klik "Buka Koleksi →" untuk mulai.</p>
            <p className="text-neutral-600 text-sm mt-1">Konten 18+, hanya untuk dewasa.</p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/post/${p.slug}`}
                className="group bg-neutral-800/50 rounded-xl overflow-hidden border border-neutral-700/50 hover:border-pink-500/30 transition-all hover:shadow-lg hover:shadow-pink-500/5"
              >
                <div className="aspect-[2/3] bg-neutral-700/50 overflow-hidden relative">
                  {p.thumbnail ? (
                    <Image src={p.thumbnail} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"/>
                      </svg>
                    </div>
                  )}
                  {p.date && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <span className="text-[10px] text-gray-300">{p.date}</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-[11px] sm:text-xs text-gray-300 line-clamp-2 group-hover:text-pink-300 transition leading-snug">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-600">
        NekoPoi — Fan project. Semua konten dari nekopoi.care.
      </footer>
    </main>
  );
}
