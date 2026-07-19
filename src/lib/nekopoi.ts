import * as cheerio from 'cheerio';

const BASE = 'https://nekopoi.care';

export interface PostItem {
  title: string;
  slug: string;
  thumbnail: string;
  date: string;
  category: string;
}

export interface DetailItem {
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
  streamServers: { label: string; url: string; quality: string }[];
  downloadLinks: { quality: string; links: { label: string; url: string }[] }[];
}

export async function getLatest(page: number = 1): Promise<PostItem[]> {
  try {
    const url = page > 1 ? `${BASE}/page/${page}/` : BASE;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const posts: PostItem[] = [];

    // Use .nk-post-card (episode terbaru grid)
    $('.nk-post-card').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('h2 a').first();
      const title = $a.text().trim();
      const href = $a.attr('href') || '';
      if (!title || !href) return;

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (!slug) return;

      // Thumbnail from .nk-thumb-crop background-image
      const style = $el.find('.nk-thumb-crop').attr('style') || '';
      const thumbMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      const thumbnail = thumbMatch ? thumbMatch[1] : '';

      // Date from span
      const dateSpan = $el.find('.nk-post-meta span').first().text().trim();
      const dateClean = dateSpan.replace(/\s+/g, ' ').trim();

      // Try to infer category from slug
      let category = '';
      if (slug.includes('/hentai/')) category = 'Hentai';
      else if (slug.includes('/3d-hentai/')) category = '3D Hentai';
      else if (slug.includes('/2d-animation/')) category = '2D Animation';
      else if (slug.includes('/jav-cosplay/')) category = 'JAV Cosplay';
      else if (slug.includes('/jav/') || slug.includes('jav-sub-indo') || slug.includes('uncensored') || slug.includes('cab-sub')) category = 'JAV';
      else {
        // Guess from title
        if (/\[JAV/i.test(title)) category = 'JAV';
        else if (/\[UNCENSORED/i.test(title)) category = 'JAV';
        else if (/\[3D/i.test(title)) category = '3D Hentai';
        else if (/\[L2D/i.test(title) || /\[2D/i.test(title)) category = '2D Animation';
        else if (title.includes('Hentai')) category = 'Hentai';
      }

      posts.push({ title, slug, thumbnail, date: dateClean, category });
    });

    // If .nk-post-card returns nothing, try alternate selectors
    if (posts.length === 0) {
      // Try h2 > a links in main content
      $('.nk-main-content h2 a').each((_, el) => {
        const $a = $(el);
        const title = $a.text().trim();
        const href = $a.attr('href') || '';
        if (!title || !href) return;

        const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
        if (!slug || slug.includes('/page/')) return;

        // Find nearest image
        const $parent = $a.closest('.nk-post-card, article, .post');
        const style = $parent.find('.nk-thumb-crop').attr('style') || '';
        const thumbMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
        const thumbnail = thumbMatch ? thumbMatch[1] : '';

        let category = '';
        if (/\[JAV/i.test(title)) category = 'JAV';
        else if (/\[UNCENSORED/i.test(title)) category = 'JAV';
        else if (/\[3D/i.test(title)) category = '3D Hentai';
        else if (/\[L2D/i.test(title) || /\[2D/i.test(title)) category = '2D Animation';
        else if (title.includes('Hentai')) category = 'Hentai';

        posts.push({ title, slug, thumbnail, date: '', category });
      });
    }

    // Dedup by slug
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
  } catch {
    return [];
  }
}

export async function getDetail(slug: string): Promise<DetailItem | null> {
  try {
    const url = `${BASE}/${slug}/`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1, .entry-title').first().text().trim();

    // Thumbnail
    const thumbnail =
      $('.wp-post-image').attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      $('.entry-content img').first().attr('src') ||
      '';

    // Extract metadata from paragraphs
    let originalTitle = '', code = '', actress = '', producers = '', duration = '', date = '', views = '';
    let size360 = '', size480 = '', size720 = '';
    const genres: string[] = [];

    $('.entry-content p, .content p, p').each((_, p) => {
      const text = $(p).text().trim();
      if (!text) return;

      if (/original\s*title/i.test(text))
        originalTitle = text.replace(/original\s*title\s*:?\s*/i, '').trim();
      else if (/nuclear\s*code/i.test(text))
        code = text.replace(/nuclear\s*code\s*:?\s*/i, '').trim();
      else if (/^actress/i.test(text))
        actress = text.replace(/actress\s*:?\s*/i, '').trim();
      else if (/^producers/i.test(text))
        producers = text.replace(/producers\s*:?\s*/i, '').trim();
      else if (/^duration/i.test(text))
        duration = text.replace(/duration\s*:?\s*/i, '').trim();
      else if (/^genre/i.test(text)) {
        const gText = text.replace(/genre\s*:?\s*/i, '').trim();
        gText.split(/,\s*/).forEach((g) => {
          const clean = g.replace(/\.$/, '').trim();
          if (clean) genres.push(clean);
        });
      } else if (/^size/i.test(text) || /360\s*p/i.test(text)) {
        const m360 = text.match(/360\s*p\s*:?\s*([\d.]+[mg]b)/i);
        if (m360) size360 = m360[1];
        const m480 = text.match(/480\s*p\s*:?\s*([\d.]+[mg]b)/i);
        if (m480) size480 = m480[1];
        const m720 = text.match(/720\s*p\s*:?\s*([\d.]+[mg]b)/i);
        if (m720) size720 = m720[1];
      }
    });

    // Date & views
    const dateEl = $('.date, time, .entry-date').first();
    let dateText = dateEl.text().trim();
    if (!dateText) {
      // Try to find date near title
      const h1Next = $('h1').nextAll('p').first().text().trim();
      if (h1Next && /\d+\s*kali/i.test(h1Next)) dateText = h1Next;
    }
    if (dateText) {
      const viewM = dateText.match(/(\d+)\s*kali/i);
      if (viewM) views = viewM[1];
      date = dateText.replace(/\d+\s*kali/i, '').trim();
    }

    // Stream servers from nk-player
    const streamServers: { label: string; url: string; quality: string }[] = [];
    const serverLabels = ['Server 1', 'Server 2', 'Server 3'];
    const serverQualities = ['360p/480p', '720p', 'Alternatif'];

    for (let i = 1; i <= 3; i++) {
      const src = $(`#nk-stream-${i} iframe`).attr('src');
      if (src) {
        streamServers.push({
          label: serverLabels[i - 1],
          url: src.startsWith('//') ? 'https:' + src : src,
          quality: serverQualities[i - 1],
        });
      }
    }

    // Fallback: any iframe in nk-player-frame
    if (streamServers.length === 0) {
      $('.nk-player-frame iframe').each((i, el) => {
        const src = $(el).attr('src') || '';
        if (src) {
          streamServers.push({
            label: `Server ${i + 1}`,
            url: src.startsWith('//') ? 'https:' + src : src,
            quality: i === 0 ? '360p/480p' : i === 1 ? '720p' : 'Alternatif',
          });
        }
      });
    }

    // Download links
    const downloadLinks: { quality: string; links: { label: string; url: string }[] }[] = [];
    $('.entry-content h4, .content h4').each((_, h4) => {
      const qText = $(h4).text().trim();
      let quality = '';
      if (/720p/i.test(qText)) quality = '720p';
      else if (/480p/i.test(qText)) quality = '480p';
      else if (/360p/i.test(qText)) quality = '360p';
      if (!quality) return;

      const links: { label: string; url: string }[] = [];
      const $nextP = $(h4).nextAll('p').first();
      $nextP.find('a').each((_, a) => {
        const label = $(a).text().trim();
        const url = $(a).attr('href') || '';
        if (label && url) links.push({ label, url });
      });

      if (links.length > 0) downloadLinks.push({ quality, links });
    });

    return {
      title, originalTitle, code, actress, producers, duration,
      genres, thumbnail, date, views, size360, size480, size720,
      streamServers, downloadLinks,
    };
  } catch {
    return null;
  }
}

export async function searchNekopoi(query: string): Promise<PostItem[]> {
  try {
    const url = `${BASE}/?s=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const posts: PostItem[] = [];

    // Search results
    $('.nk-post-card').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('h2 a').first();
      const title = $a.text().trim();
      const href = $a.attr('href') || '';
      if (!title || !href) return;

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (!slug) return;

      const style = $el.find('.nk-thumb-crop').attr('style') || '';
      const thumbMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      const thumbnail = thumbMatch ? thumbMatch[1] : '';

      let category = '';
      if (/\[JAV/i.test(title)) category = 'JAV';
      else if (/\[3D/i.test(title)) category = '3D Hentai';
      else if (/\[L2D/i.test(title)) category = '2D Animation';

      posts.push({ title, slug, thumbnail, date: '', category });
    });

    return posts;
  } catch {
    return [];
  }
}

export async function getCategoryPage(
  category: string,
  page: number = 1
): Promise<PostItem[]> {
  try {
    let catSlug = '';
    switch (category.toLowerCase()) {
      case 'hentai': catSlug = 'category/hentai'; break;
      case '2d-animation': case '2danimation': catSlug = 'category/2d-animation'; break;
      case '3d-hentai': case '3dhentai': catSlug = 'category/3d-hentai'; break;
      case 'jav': catSlug = 'category/jav'; break;
      case 'jav-cosplay': case 'javcosplay': catSlug = 'category/jav-cosplay'; break;
      default: catSlug = `category/${category}`;
    }

    const url = page > 1
      ? `${BASE}/${catSlug}/page/${page}/`
      : `${BASE}/${catSlug}/`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const posts: PostItem[] = [];

    $('.nk-post-card').each((_, el) => {
      const $el = $(el);
      const $a = $el.find('h2 a').first();
      const title = $a.text().trim();
      const href = $a.attr('href') || '';
      if (!title || !href) return;

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (!slug) return;

      const style = $el.find('.nk-thumb-crop').attr('style') || '';
      const thumbMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      const thumbnail = thumbMatch ? thumbMatch[1] : '';

      const dateSpan = $el.find('.nk-post-meta span').first().text().trim();

      posts.push({ title, slug, thumbnail, date: dateSpan, category });
    });

    return posts;
  } catch {
    return [];
  }
}

// Hentai List - scrape from /hentai-list/
export async function getHentaiList(): Promise<any[]> {
  try {
    const res = await fetch(`${BASE}/hentai-list/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const items: any[] = [];

    // The list is in .nk-hentai-grid with li > a.nk-series-link
    $('.nk-hentai-grid li a.nk-series-link').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const title = $el.find('.title').text().trim();
      if (!href || !title) return;

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      const style = $el.find('.nk-hentai-thumb').attr('style') || '';
      const thumbMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      const thumbnail = thumbMatch ? thumbMatch[1] : '';

      items.push({ title, slug, thumbnail, type: 'hentai' });
    });

    return items;
  } catch {
    return [];
  }
}

// JAV List - scrape from /jav-list/
export async function getJavList(): Promise<any[]> {
  try {
    const res = await fetch(`${BASE}/jav-list/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const items: any[] = [];

    // JAV list uses .nk-jav-grid with li > a
    $('.nk-jav-grid li a').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const title = $el.find('.nk-jav-meta h2, .title').first().text().trim();
      if (!href || !title) return;

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      const style = $el.find('.nk-thumb-crop, .nk-hentai-thumb').attr('style') || '';
      const thumbMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      const thumbnail = thumbMatch ? thumbMatch[1] : '';

      items.push({ title, slug, thumbnail, type: 'jav' });
    });

    return items;
  } catch {
    return [];
  }
}

// Genre List - scrape from /genre-list/
export async function getGenreList(): Promise<{ name: string; slug: string }[]> {
  try {
    const res = await fetch(`${BASE}/genre-list/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const genres: { name: string; slug: string }[] = [];

    $('.entry-content a, .content a').each((_, el) => {
      const $el = $(el);
      const name = $el.text().trim();
      const href = $el.attr('href') || '';
      if (!name || !href || !href.includes('/genre/')) return;

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (slug && name.length > 1) genres.push({ name, slug });
    });

    return genres;
  } catch {
    return [];
  }
}

// Jadwal New Hentai  
export async function getJadwalHentai(): Promise<string> {
  try {
    const res = await fetch(`${BASE}/jadwal-new-hentai/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    return $('.entry-content').html() || $('.content').html() || '';
  } catch {
    return '';
  }
}
