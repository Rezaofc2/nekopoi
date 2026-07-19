'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HentaiItem {
  title: string;
  slug: string;
  thumbnail: string;
  type: string;
}

export default function HentaiListPage() {
  const [items, setItems] = useState<HentaiItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/hentai-list')
      .then(r => r.json())
      .then(d => { setItems(d || []); setLoading(false); })
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
          <h1 className="text-sm font-bold">Hentai List</h1>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-3 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p>Tidak ada data.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={"/post/" + item.slug}
                className="group bg-[#16213e] rounded-lg overflow-hidden border border-pink-500/10 hover:border-pink-400/40 transition-all"
              >
                <div className="aspect-[2/3] bg-[#1a1a2e] relative overflow-hidden">
                  {item.thumbnail ? (
                    <Image src={item.thumbnail} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="20vw" unoptimized />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="text-[11px] font-medium text-gray-300 line-clamp-2 group-hover:text-pink-300 transition leading-snug">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
