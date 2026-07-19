'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/detail?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Gagal memuat'); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-3/4" />
          <div className="h-64 bg-neutral-800 rounded-xl" />
          <div className="h-4 bg-neutral-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Tidak ditemukan'}</p>
          <Link href="/" className="text-pink-400 hover:text-pink-300">← Kembali</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Back */}
        <Link href="/" className="text-xs text-neutral-500 hover:text-pink-400 mb-4 inline-block">← Kembali</Link>

        {/* Header */}
        <h1 className="text-lg sm:text-xl font-bold leading-tight mb-4">{data.title}</h1>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-neutral-800/50 rounded-xl p-4 border border-neutral-700/50">
          {data.thumbnail && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-neutral-700 sm:col-span-2">
              <Image src={data.thumbnail} alt={data.title} fill className="object-cover" unoptimized sizes="100vw" />
            </div>
          )}
          {data.originalTitle && (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Original Title</span>
              <p className="text-xs text-neutral-300">{data.originalTitle}</p>
            </div>
          )}
          {data.code && <Info label="Code" value={data.code} />}
          {data.actress && <Info label="Actress" value={data.actress} />}
          {data.producers && <Info label="Producers" value={data.producers} />}
          {data.duration && <Info label="Duration" value={data.duration} />}
          {data.date && <Info label="Release" value={data.date} />}
          {data.views && <Info label="Views" value={`${data.views} kali`} />}
          
          {data.size360 || data.size480 || data.size720 ? (
            <div className="sm:col-span-2">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Size</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {data.size360 && <span className="px-2 py-0.5 bg-neutral-700 rounded text-xs text-neutral-300">360p: {data.size360}</span>}
                {data.size480 && <span className="px-2 py-0.5 bg-neutral-700 rounded text-xs text-neutral-300">480p: {data.size480}</span>}
                {data.size720 && <span className="px-2 py-0.5 bg-neutral-700 rounded text-xs text-neutral-300">720p: {data.size720}</span>}
              </div>
            </div>
          ) : null}
        </div>

        {/* Genres */}
        {data.genres && data.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-6">
            {data.genres.map((g: string) => (
              <span key={g} className="px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[11px] rounded-full">{g}</span>
            ))}
          </div>
        )}

        {/* Stream */}
        {data.streamServers && data.streamServers.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-pink-500 rounded-full" />
              Streaming
            </h2>
            <div className="flex gap-2 flex-wrap">
              {data.streamServers.map((s: string, i: number) => (
                <a key={i} href={s} target="_blank" rel="noreferrer" className="px-4 py-2 bg-pink-600/20 text-pink-400 text-sm rounded-lg hover:bg-pink-600/30 border border-pink-500/20 transition">
                  Server {i + 1}
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Download */}
        {data.downloadLinks && data.downloadLinks.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-pink-500 rounded-full" />
              Download
            </h2>
            <div className="space-y-3">
              {data.downloadLinks.map((dl: any, i: number) => (
                <div key={i} className="bg-neutral-800/50 rounded-xl p-3 border border-neutral-700/50">
                  <span className="text-xs font-medium text-pink-400">{dl.quality}</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dl.links.map((l: any, j: number) => (
                      <a key={j} href={l.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-neutral-700 text-xs rounded-lg hover:bg-neutral-600 text-neutral-300 transition">
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</span>
      <p className="text-xs text-neutral-300">{value}</p>
    </div>
  );
}
