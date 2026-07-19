# NekoPoi — Streaming Scraper

Scraper & streaming web untuk [nekopoi.care](https://nekopoi.care) — tampilan UI mirip original, **tanpa iklan**.

## Fitur

- 🎨 Dark theme UI mirip nekopoi.care asli (pink accent, grid layout)
- 📱 Responsive mobile-first design
- 🔍 Search judul / genre
- 📺 Streaming langsung via iframe (Server 1/2/3) — **tanpa iklan**
- ⬇️ Download links (360p, 480p, 720p) via Mp4Upload, PixelDrain, Mirror
- 💡 Mode "Matikan Lampu" & Fullscreen
- 🎲 Random post
- 📂 Kategori (Hentai, JAV, 2D Animation, 3D Hentai, dll)
- ⚡ Server-side scraping dengan cheerio

## Teknologi

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Cheerio** untuk scraping

## Cara Deploy

### Vercel (Rekomendasi)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Rezaofc2/nekopoi)

### Lokal

```bash
npm install
npm run dev
# buka http://localhost:3000
```

## Struktur Proyek

```
src/
├── app/
│   ├── api/
│   │   ├── latest/route.ts    # Get latest posts
│   │   ├── detail/route.ts    # Get post detail + stream
│   │   ├── search/route.ts    # Search posts
│   │   └── random/route.ts    # Random post
│   ├── category/[cat]/page.tsx # Category page
│   ├── post/[slug]/page.tsx   # Detail + streaming page
│   ├── random/page.tsx        # Random redirect
│   ├── layout.tsx
│   ├── page.tsx               # Home page
│   └── globals.css
└── lib/
    └── nekopoi.ts             # Scraper logic
```

## Disclaimer

Situs ini TIDAK menyimpan file apapun. Semua konten di-scrape dari nekopoi.care (pihak ketiga). Untuk 18+ saja.

---

© NekoPoi — Fan Project
