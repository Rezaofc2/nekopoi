import * as cheerio from 'cheerio';

const BASE = 'https://nekopoi.care';

export interface PostItem {
  title: string;
  slug: string;
  thumbnail: string;
  date: string;
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
  streamServers: string[];
  downloadLinks: { quality: string; links: { label: string; url: string }[] }[];
}

export async function getLatest(): Promise<PostItem[]> {
  try {
    const res = await fetch(BASE, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const posts: PostItem[] = [];

    $('.eropost, article, .post, .grid-item').each((_, el) => {
      const a = $(el).find('h2 a, .entry-title a, a').first();
      let title = a.text().trim();
      let href = a.attr('href') || '';
      
      // Fallback to first link
      if (!title || !href) {
        const firstA = $(el).find('a[href*="nekopoi.care"]').first();
        title = firstA.find('h2, .title').text().trim() || firstA.attr('title') || title;
        href = firstA.attr('href') || href;
      }

      if (!href || !href.includes(BASE)) {
        if (href.startsWith('/')) href = BASE + href;
        else return;
      }

      const slug = href.replace(BASE + '/', '').replace(/\/$/, '');
      if (!slug || slug === '' || slug.includes('jav-sub-indo') === false && slug.includes('hentai') === false && slug.includes('uncensored') === false && slug.includes('cab-sub') === false) return;

      const img = $(el).find('img').first();
      const thumbnail = img.attr('src') || img.attr('data-src') || '';
      const date = $(el).find('.date, time, .entry-date').first().text().trim() || '';

      if (title && slug) {
        posts.push({ title, slug, thumbnail, date });
      }
    });

    return posts;
  } catch {
    return [];
  }
}

export async function getDetail(slug: string): Promise<DetailItem | null> {
  try {
    const res = await fetch(`${BASE}/${slug}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1, .entry-title').first().text().trim();
    const thumbnail = $('img').first().attr('src') || '';

    // Extract metadata from content paragraphs
    let originalTitle = '', code = '', actress = '', producers = '', duration = '', date = '', views = '';
    let size360 = '', size480 = '', size720 = '';
    const genres: string[] = [];

    $('.entry-content p, .content p, p').each((_, p) => {
      const text = $(p).text().trim();
      
      if (text.includes('Original Title')) originalTitle = text.replace(/Original Title\s*:?\s*/i, '').trim();
      if (text.includes('Nuclear Code') || text.includes('Code')) code = text.replace(/(Nuclear\s*)?Code\s*:?\s*/i, '').trim();
      if (text.includes('Actress')) actress = text.replace(/Actress\s*:?\s*/i, '').trim();
      if (text.includes('Producers')) producers = text.replace(/Producers\s*:?\s*/i, '').trim();
      if (text.includes('Duration')) duration = text.replace(/Duration\s*:?\s*/i, '').trim();
      if (text.includes('Genre')) {
        const gText = text.replace(/Genre\s*:?\s*/i, '').trim();
        gText.split(/,\s*/).forEach(g => {
          const clean = g.trim();
          if (clean) genres.push(clean);
        });
      }
      if (text.includes('360p') || text.includes('360P')) {
        const m = text.match(/360p?\s*:?\s*([\d.]+[mg]b)/i);
        if (m) size360 = m[1];
      }
      if (text.includes('480p') || text.includes('480P')) {
        const m = text.match(/480p?\s*:?\s*([\d.]+[mg]b)/i);
        if (m) size480 = m[1];
      }
      if (text.includes('720p') || text.includes('720P')) {
        const m = text.match(/720p?\s*:?\s*([\d.]+[mg]b)/i);
        if (m) size720 = m[1];
      }
    });

    // Date & views
    const dateText = $('.date, time, .entry-date, p:contains("kali")').first().text().trim();
    if (dateText) {
      const viewM = dateText.match(/(\d+)\s*kali/i);
      if (viewM) views = viewM[1];
      date = dateText.replace(/\d+\s*kali/i, '').trim();
    }

    // Stream servers
    const streamServers: string[] = [];
    $('iframe').each((_, iframe) => {
      const src = $(iframe).attr('src') || '';
      if (src) streamServers.push(src);
    });

    // Download links
    const downloadLinks: { quality: string; links: { label: string; url: string }[] }[] = [];

    // Parse download sections - look for quality headers and their links
    $('.entry-content h4, .content h4, h4').each((_, h4) => {
      const qText = $(h4).text().trim();
      let quality = '';
      if (qText.includes('720p')) quality = '720p';
      else if (qText.includes('480p')) quality = '480p';
      else if (qText.includes('360p')) quality = '360p';
      if (!quality) return;

      const links: { label: string; url: string }[] = [];
      $(h4).nextAll('p').first().find('a').each((_, a) => {
        links.push({ label: $(a).text().trim(), url: $(a).attr('href') || '' });
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
