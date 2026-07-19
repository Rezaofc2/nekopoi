'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PostItem {
  title: string;
  slug: string;
  thumbnail: string;
  date: string;
  category: string;
}

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Hentai', href: '/category/hentai', icon: '🔞' },
  { label: '2D Animation', href: '/category/2d-animation', icon: '🎬' },
  { label: '3D Hentai', href: '/category/3d-hentai', icon: '🎮' },
  { label: 'JAV', href: '/category/jav', icon: '🎥' },
  { label: 'JAV Cosplay', href: '/category/jav-cosplay', icon: '👘' },
];

export default function HomePage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async (pageNum: number, append: boolean = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/latest?page=${pageNum}`);
      const data = await res.json();
      if (append) {
        setPosts((prev) => [...prev, ...data]);
      } else {
        setPosts(data || []);
      }
      setHasMore(data && data.length >= 12);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setPosts(data || []);
      setHasMore(false);
    } catch {}
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur border-b border-pink-500/20">
        <div className="max-w-6xl mx-auto px-3 py-2 flex items-center justify-between">
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-pink-400 hover:text-pink-300 md:hidden"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xl font-bold">
              <span className="text-pink-400">Neko</span>
              <span className="text-white">Poi</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-2.5 py-1.5 text-gray-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search + Actions */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 text-gray-400 hover:text-pink-400 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Random */}
            <Link
              href="/random"
              className="p-1.5 text-gray-400 hover:text-pink-400 transition"
              title="Acak"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Search Bar (expandable) */}
        {searchOpen && (
          <div className="border-t border-pink-500/10 px-3 py-2">
            <form onSubmit={handleSearch} className="max-w-6xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Judul / Genre di sini..."
                className="w-full bg-[#16213e] border border-pink-500/20 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-400/50 transition"
              />
            </form>
          </div>
        )}
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-[#16213e] z-50 md:hidden overflow-y-auto shadow-xl border-r border-pink-500/20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="text-xl font-bold">
                  <span className="text-pink-400">Neko</span>
                  <span className="text-white">Poi</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-pink-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition"
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-pink-500/10 my-2 pt-2">
                  <Link
                    href="/hentai-list"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition"
                  >
                    📋 Hentai List
                  </Link>
                  <Link
                    href="/jav-list"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition"
                  >
                    📋 JAV List
                  </Link>
                  <Link
                    href="/genre-list"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition"
                  >
                    🏷️ Genre List
                  </Link>
                  <Link
                    href="/jadwal-new-hentai"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-pink-300 hover:bg-pink-500/10 rounded-lg transition"
                  >
                    📅 Jadwal Hentai
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* App Banner */}
      <div className="bg-gradient-to-r from-pink-600/20 to-pink-500/10 border-b border-pink-500/20">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <a
            href="https://linkpoi.me/neko"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 text-sm font-medium text-pink-300 hover:text-pink-200 transition"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Download App NekoPoi
          </a>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-3 py-6">
        {/* Recommended */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-pink-500 rounded-full" />
            <h2 className="text-base font-bold text-white">DIREKOMENDASIKAN</h2>
          </div>
          {posts.length > 0 && (
            <Link
              href={`/post/${posts[0].slug}`}
              className="block relative rounded-xl overflow-hidden border border-pink-500/20 hover:border-pink-400/40 transition group"
            >
              <div className="aspect-[16/9] bg-[#16213e] relative">
                {posts[0].thumbnail ? (
                  <Image
                    src={posts[0].thumbnail}
                    alt={posts[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="100vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="inline-block px-2 py-0.5 bg-pink-500/80 text-white text-[10px] rounded mb-2">
                    REKOMENDASI
                  </span>
                  <h3 className="text-lg font-bold text-white leading-snug line-clamp-2">
                    {posts[0].title}
                  </h3>
                  {posts[0].date && (
                    <p className="text-xs text-gray-400 mt-1">{posts[0].date}</p>
                  )}
                </div>
              </div>
            </Link>
          )}
        </section>

        {/* Latest Episodes */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1 h-5 bg-pink-500 rounded-full" />
            <h2 className="text-base font-bold text-white">EPISODE TERBARU</h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {posts.slice(1).map((p) => (
              <Link
                key={p.slug}
                href={`/post/${p.slug}`}
                className="group bg-[#16213e] rounded-lg overflow-hidden border border-pink-500/10 hover:border-pink-400/40 transition-all hover:shadow-lg hover:shadow-pink-500/5"
              >
                <div className="aspect-[2/3] bg-[#1a1a2e] relative overflow-hidden">
                  {p.thumbnail ? (
                    <Image
                      src={p.thumbnail}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="20vw"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  )}
                  {p.category && (
                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-pink-500/80 text-white text-[9px] rounded font-medium">
                        {p.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="text-[11px] font-medium text-gray-300 line-clamp-2 group-hover:text-pink-300 transition leading-snug">
                    {p.title}
                  </h3>
                  {p.date && (
                    <p className="text-[10px] text-gray-500 mt-1">{p.date}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {hasMore && !loading && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-pink-500/10 py-6 text-center">
        <p className="text-xs text-gray-600">
          © NekoPoi — Situs ini tidak menyimpan file apapun di servernya. Semua konten disediakan oleh pihak ketiga.
        </p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/privacy" className="text-[10px] text-gray-600 hover:text-pink-400">
            Privacy Policy
          </Link>
          <span className="text-[10px] text-gray-600">•</span>
          <span className="text-[10px] text-gray-600">2257</span>
        </div>
      </footer>
    </div>
  );
}
