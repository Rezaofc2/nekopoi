'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface StreamServer {
  label: string;
  url: string;
  quality: string;
}

interface DownloadLink {
  quality: string;
  links: { label: string; url: string }[];
}

interface DetailData {
  title: string;
  originalTitle: string;
  code: string;
  actress: string;
  producers: string;
  duration: string;
  genres: string[];
  thumbnail: string;
  date: string;
  views: string;
  size360: string;
  size480: string;
  size720: string;
  streamServers: StreamServer[];
  downloadLinks: DownloadLink[];
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeServer, setActiveServer] = useState(0);
  const [lightsOff, setLightsOff] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/detail?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat konten.');
        setLoading(false);
      });
  }, [slug]);

  const toggleFullscreen = () => {
    const el = document.getElementById('nk-video-container');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-6 bg-[#16213e] rounded w-3/4" />
          <div className="aspect-video bg-[#16213e] rounded-xl" />
          <div className="h-4 bg-[#16213e] rounded w-1/2" />
          <div className="h-3 bg-[#16213e] rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Tidak ditemukan'}</p>
          <Link href="/" className="text-pink-400 hover:text-pink-300">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#1a1a2e] text-white ${lightsOff ? 'nk-lights-off' : ''}`}>
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-[#1a1a2e]/95 backdrop-blur border-b border-pink-500/20">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-3">
          <Link href="/" className="text-pink-400 hover:text-pink-300 flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <div className="text-sm font-bold truncate">
            <span className="text-pink-400">Neko</span>
            <span className="text-white">Poi</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div id="nk-video-container" className="max-w-5xl mx-auto">
        {!lightsOff && (
          <>
            {/* Title */}
            <div className="px-4 pt-4 pb-2">
              <h1 className="text-lg font-bold leading-tight">{data.title}</h1>
              {data.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {data.views && `${data.views} kali • `}
                  {data.date}
                </p>
              )}
            </div>

            {/* Thumbnail / Poster */}
            {data.thumbnail && (
              <div className="px-4 mb-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-[#16213e]">
                  <Image
                    src={data.thumbnail}
                    alt={data.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Stream Player */}
        {data.streamServers.length > 0 && (
          <div className={`${lightsOff ? 'fixed inset-0 z-50 bg-black flex flex-col' : 'px-4 mb-4'}`}>
            {/* Player Controls Bar */}
            <div
              className={`flex items-center justify-between ${
                lightsOff ? 'px-4 py-2 bg-black/80' : 'bg-[#16213e] rounded-t-lg px-3 py-2'
              }`}
            >
              <div className="flex gap-1">
                {data.streamServers.map((srv, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveServer(i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                      i === activeServer
                        ? 'bg-pink-500 text-white'
                        : 'bg-[#1a1a2e] text-gray-400 hover:text-pink-300 hover:bg-pink-500/10'
                    }`}
                  >
                    {srv.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLightsOff(!lightsOff)}
                  className="p-1.5 text-gray-400 hover:text-pink-400 transition rounded"
                  title="Matikan Lampu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18h6M10 22h4M12 2v1M12 7a4 4 0 014 4c0 1.5-.8 2.8-2 3.4V16h-4v-1.6A4.02 4.02 0 018 11a4 4 0 014-4z" />
                  </svg>
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-gray-400 hover:text-pink-400 transition rounded"
                  title="Layar Penuh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe Player */}
            <div className={`${lightsOff ? 'flex-1' : 'aspect-video'} bg-black relative`}>
              <iframe
                src={data.streamServers[activeServer].url}
                className="w-full h-full border-0"
                allowFullScreen
                scrolling="no"
                title="Streaming Player"
              />
            </div>

            {/* Server Info */}
            {!lightsOff && (
              <div className="bg-[#16213e] rounded-b-lg px-3 py-2 text-[10px] text-gray-500">
                <span className="text-pink-400 font-medium">
                  {data.streamServers[activeServer].label}
                </span>
                {' — '}
                {data.streamServers[activeServer].quality}
              </div>
            )}
          </div>
        )}

        {data.streamServers.length === 0 && !lightsOff && (
          <div className="px-4 mb-4">
            <div className="aspect-video bg-[#16213e] rounded-lg flex items-center justify-center border border-pink-500/10">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <p className="text-sm">Streaming tidak tersedia</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        {!lightsOff && (
          <div className="px-4 pb-8 space-y-6">
            {/* Meta Info Grid */}
            <div className="bg-[#16213e] rounded-xl p-4 border border-pink-500/10 space-y-3">
              {data.originalTitle && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Original Title</span>
                  <p className="text-xs text-gray-300 mt-0.5">{data.originalTitle}</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.code && <MetaInfo label="Code" value={data.code} />}
                {data.actress && <MetaInfo label="Actress" value={data.actress} />}
                {data.producers && <MetaInfo label="Producers" value={data.producers} />}
                {data.duration && <MetaInfo label="Duration" value={data.duration} />}
                {data.views && <MetaInfo label="Views" value={`${data.views} kali`} />}
              </div>
              {(data.size360 || data.size480 || data.size720) && (
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Size</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {data.size360 && (
                      <span className="px-2 py-0.5 bg-[#1a1a2e] rounded text-[11px] text-gray-300">
                        360p: {data.size360}
                      </span>
                    )}
                    {data.size480 && (
                      <span className="px-2 py-0.5 bg-[#1a1a2e] rounded text-[11px] text-gray-300">
                        480p: {data.size480}
                      </span>
                    )}
                    {data.size720 && (
                      <span className="px-2 py-0.5 bg-[#1a1a2e] rounded text-[11px] text-gray-300">
                        720p: {data.size720}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Genres */}
            {data.genres.length > 0 && (
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Genre</span>
                <div className="flex flex-wrap gap-1.5">
                  {data.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2.5 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[11px] rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Download Section */}
            {data.downloadLinks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1 h-4 bg-pink-500 rounded-full" />
                  <h2 className="text-sm font-bold">Unduh</h2>
                </div>
                <div className="space-y-3">
                  {data.downloadLinks.map((dl, i) => (
                    <div
                      key={i}
                      className="bg-[#16213e] rounded-xl p-3 border border-pink-500/10"
                    >
                      <span className="text-xs font-semibold text-pink-400">{dl.quality}</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dl.links.map((l, j) => (
                          <a
                            key={j}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-[#1a1a2e] text-xs rounded-lg hover:bg-pink-500/20 text-gray-300 hover:text-pink-300 transition border border-pink-500/10"
                          >
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
        )}
      </div>

      {/* Lights Off CSS */}
      <style jsx global>{`
        .nk-lights-off {
          background: #000 !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

function MetaInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      <p className="text-xs text-gray-300 mt-0.5">{value}</p>
    </div>
  );
}
