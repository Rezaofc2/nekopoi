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

    // Target .eropost articles (the theme's post grid)
    $('.eropost').each((_, el) => {
      const $el = $(el);
      const a = $el.find('h2 a').first();
      const title = a.text().trim();
      const href = a.attr('href') || '';
      if (!title || !href) return;

      let slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (!slug) return;

      const img = $el.find('img').first();
      const thumbnail = img.attr('src') || img.attr('data-src') || '';

      // Parse date from the "info" div
      const dateRaw = $el.find('.date, .info').first().text().trim();
      const dateMatch = dateRaw.match(/(\d{1,2}\s+\w+\s+\d{4})/);
      const date = dateMatch ? dateMatch[1] : '';

      // Category
      const cat = $el.find('.cat a, .category a').first().text().trim();

      posts.push({ title, slug, thumbnail, date, category: cat });
    });

    return posts;
  } catch {
    return [];
  }
}

export async function getDetail(slug: string): Promise<DetailItem | null> {
  try {
    const res = await fetch(`${BASE}/${slug}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1, .entry-title').first().text().trim();

    // Thumbnail - find featured image
    const thumbnail =
      $('.wp-post-image').attr('src') ||
      $('.entry-content img').first().attr('src') ||
      $('meta[property="og:image"]').attr('content') ||
      '';

    // Extract metadata from paragraphs
    let originalTitle = '',
      code = '',
      actress = '',
      producers = '',
      duration = '',
      date = '',
      views = '';
    let size360 = '',
      size480 = '',
      size720 = '';
    const genres: string[] = [];

    $('.entry-content p, .content p').each((_, p) => {
      const text = $(p).text().trim();

      if (/original\s*title/i.test(text))
        originalTitle = text.replace(/original\s*title\s*:?\s*/i, '').trim();
      if (/nuclear\s*code|code\s*:/i.test(text))
        code = text.replace(/(nuclear\s*)?code\s*:?\s*/i, '').trim();
      if (/actress/i.test(text))
        actress = text.replace(/actress\s*:?\s*/i, '').trim();
      if (/producers/i.test(text))
        producers = text.replace(/producers\s*:?\s*/i, '').trim();
      if (/duration/i.test(text))
        duration = text.replace(/duration\s*:?\s*/i, '').trim();
      if (/genre/i.test(text)) {
        const gText = text.replace(/genre\s*:?\s*/i, '').trim();
        gText.split(/,\s*/).forEach((g) => {
          const clean = g.replace(/\.$/, '').trim();
          if (clean) genres.push(clean);
        });
      }
      if (/360\s*p/i.test(text)) {
        const m = text.match(/360\s*p\s*:?\s*([\d.]+[mg]b)/i);
        if (m) size360 = m[1];
      }
      if (/480\s*p/i.test(text)) {
        const m = text.match(/480\s*p\s*:?\s*([\d.]+[mg]b)/i);
        if (m) size480 = m[1];
      }
      if (/720\s*p/i.test(text)) {
        const m = text.match(/720\s*p\s*:?\s*([\d.]+[mg]b)/i);
        if (m) size720 = m[1];
      }
    });

    // Date & views
    const dateEl = $('.date, time, .entry-date, h1 + p').first();
    const dateText = dateEl.text().trim();
    if (dateText) {
      const viewM = dateText.match(/(\d+)\s*kali/i);
      if (viewM) views = viewM[1];
      const dateM = dateText.match(
        /(senin|selasa|rabu|kamis|jumat|sabtu|minggu)[,.\s]*(\d{1,2}\s+\w+\s+\d{4})/i
      );
      if (dateM) date = dateM[0];
      else date = dateText.replace(/\d+\s*kali/i, '').trim();
    }

    // Stream servers — extract from nk-player
    const streamServers: { label: string; url: string; quality: string }[] = [];
    const serverLabels = ['Server 1', 'Server 2', 'Server 3'];
    const serverQualities = ['360p/480p', '720p', 'Alternatif'];

    // Extract from nk-stream-X divs
    for (let i = 1; i <= 3; i++) {
      const iframe = $(`#nk-stream-${i} iframe`).attr('src');
      if (iframe) {
        streamServers.push({
          label: serverLabels[i - 1],
          url: iframe.startsWith('//') ? 'https:' + iframe : iframe,
          quality: serverQualities[i - 1],
        });
      }
    }

    // Fallback: extract any iframe from .nk-player-frame
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

    // Look for download sections with quality headers
    $('.entry-content h4, .content h4').each((_, h4) => {
      const qText = $(h4).text().trim();
      let quality = '';
      if (/720p/i.test(qText)) quality = '720p';
      else if (/480p/i.test(qText)) quality = '480p';
      else if (/360p/i.test(qText)) quality = '360p';
      if (!quality) return;

      const links: { label: string; url: string }[] = [];
      // Links are in the next p or following elements
      const $nextP = $(h4).nextAll('p').first();
      $nextP.find('a').each((_, a) => {
        const label = $(a).text().trim();
        const url = $(a).attr('href') || '';
        if (label && url) links.push({ label, url });
      });

      if (links.length > 0) {
        downloadLinks.push({ quality, links });
      }
    });

    return {
      title,
      originalTitle,
      code,
      actress,
      producers,
      duration,
      genres,
      thumbnail,
      date,
      views,
      size360,
      size480,
      size720,
      streamServers,
      downloadLinks,
    };
  } catch {
    return null;
  }
}

export async function searchNekopoi(query: string, page: number = 1): Promise<PostItem[]> {
  try {
    const url = `${BASE}/page/${page}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const posts: PostItem[] = [];

    $('.eropost').each((_, el) => {
      const a = $(el).find('h2 a').first();
      const title = a.text().trim();
      const href = a.attr('href') || '';
      if (!title || !href) return;

      let slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (!slug) return;

      const img = $(el).find('img').first();
      const thumbnail = img.attr('src') || img.attr('data-src') || '';
      const cat = $(el).find('.cat a, .category a').first().text().trim();

      posts.push({ title, slug, thumbnail, date: '', category: cat });
    });

    return posts;
  } catch {
    return [];
  }
}
