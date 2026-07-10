import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import * as dns from 'dns';
import * as net from 'net';
import { requireEnv } from '../common/require-env';

/** Blocks SSRF: refuses to fetch URLs that resolve to loopback/private/link-local addresses. */
async function assertPublicHttpUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BadRequestException('Некорректный URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BadRequestException('Разрешены только http/https ссылки');
  }
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    throw new BadRequestException('Недопустимый адрес');
  }

  const addresses = net.isIP(hostname)
    ? [hostname]
    : (await dns.promises.lookup(hostname, { all: true })).map((a) => a.address);

  for (const addr of addresses) {
    if (isPrivateOrLoopback(addr)) {
      throw new BadRequestException('Недопустимый адрес');
    }
  }
}

function isPrivateOrLoopback(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 127 || // loopback
      a === 10 || // 10.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      (a === 169 && b === 254) || // 169.254.0.0/16 (incl. cloud metadata)
      a === 0
    );
  }
  const lower = ip.toLowerCase();
  return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/124.0.0.0 Safari/537.36';

/** Приоритетные домены электроники (СНГ + мировые) */
const PRODUCT_DOMAINS = [
  'dns-shop.ru', 'citilink.ru', 'eldorado.ru', 'mvideo.ru',
  'technodom.com', 'sulpak.kz', 'mechta.kz',
  'samsung.com', 'acer.com', 'lenovo.com', 'lg.com', 'sony.com',
  'asus.com', 'hp.com', 'dell.com', 'huawei.com', 'xiaomi.com',
];

@Injectable()
export class ImageFetchService {
  private readonly logger = new Logger(ImageFetchService.name);

  /**
   * Загружает изображение в Cloudinary по URL.
   * Принимает как прямую ссылку на картинку, так и ссылку на страницу товара
   * (в этом случае автоматически извлекает og:image со страницы).
   */
  async uploadFromUrl(productId: number, imageUrl: string): Promise<string> {
    this.logger.log(`Upload from URL: ${imageUrl}`);

    // Если это страница (не прямое изображение) — извлекаем og:image
    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i.test(imageUrl);
    if (!isDirectImage) {
      this.logger.log('Detected product page URL — extracting og:image...');
      const extracted = await this.extractProductImage(imageUrl).catch(() => null);
      if (!extracted) {
        throw new BadRequestException(
          'Не удалось найти изображение на этой странице. ' +
          'Попробуйте: нажмите правой кнопкой мыши на фото товара → «Копировать адрес изображения»',
        );
      }
      this.logger.log(`Extracted image: ${extracted}`);
      imageUrl = extracted;
    }

    const buffer = await this.download(imageUrl);
    return this.upload(buffer, productId);
  }

  /**
   * Главный метод: ищет товар через поиск, заходит на страницу товара,
   * берёт оттуда фото и загружает в Cloudinary.
   */
  async searchAndUpload(productId: number, query: string): Promise<string> {
    this.logger.log(`Searching product page for: "${query}"`);

    // ── Шаг 1: найти страницу товара через текстовый поиск ──────────
    const pageUrl = await this.findProductPageUrl(query);

    if (pageUrl) {
      this.logger.log(`Found product page: ${pageUrl}`);
      try {
        const imageUrl = await this.extractProductImage(pageUrl);
        if (imageUrl) {
          this.logger.log(`Extracted image URL: ${imageUrl}`);
          const buffer = await this.download(imageUrl);
          const cloudUrl = await this.upload(buffer, productId);
          this.logger.log(`Uploaded: ${cloudUrl}`);
          return cloudUrl;
        }
      } catch (e: any) {
        this.logger.warn(`Product page approach failed: ${e.message}`);
      }
    }

    // ── Шаг 2: fallback — поиск картинок напрямую ───────────────────
    this.logger.log('Falling back to image search...');
    const urls = await this.searchImages(query);
    if (!urls.length) {
      throw new BadRequestException(`Изображения по запросу «${query}» не найдены`);
    }

    for (const url of urls.slice(0, 10)) {
      try {
        const buffer = await this.download(url);
        const cloudUrl = await this.upload(buffer, productId);
        this.logger.log(`Uploaded (fallback): ${cloudUrl}`);
        return cloudUrl;
      } catch (e: any) {
        this.logger.warn(`Skip ${url}: ${e.message}`);
      }
    }

    throw new BadRequestException('Ни одно из найденных изображений не удалось загрузить');
  }

  // ── Поиск страницы товара ────────────────────────────────────────

  /**
   * Ищет через DuckDuckGo (HTML-версия) и возвращает URL
   * первого результата с известного сайта электроники.
   */
  private async findProductPageUrl(query: string): Promise<string | null> {
    try {
      const { data: html } = await axios.get('https://html.duckduckgo.com/html/', {
        params: { q: `${query} купить`, kl: 'ru-ru' },
        headers: {
          'User-Agent': UA,
          Accept: 'text/html',
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        },
        timeout: 15_000,
      });

      // DDG HTML кодирует URL в параметре uddg=
      const matches = [...html.matchAll(/uddg=(https?%3A%2F%2F[^&"'\s]+)/g)];
      for (const m of matches) {
        const url = decodeURIComponent(m[1]);
        if (PRODUCT_DOMAINS.some((d) => url.includes(d))) {
          return url;
        }
      }

      // Прямые href (иногда DDG отдаёт без редиректа)
      const directMatches = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)];
      for (const m of directMatches) {
        if (PRODUCT_DOMAINS.some((d) => m[1].includes(d))) {
          return m[1];
        }
      }
    } catch (e: any) {
      this.logger.warn(`DDG text search failed: ${e.message}`);
    }

    // Запасной вариант — Яндекс
    try {
      const { data: html } = await axios.get('https://yandex.ru/search/', {
        params: { text: `${query} купить`, lr: 168 },
        headers: {
          'User-Agent': UA,
          Accept: 'text/html',
          'Accept-Language': 'ru-RU,ru;q=0.9',
        },
        timeout: 15_000,
      });

      const matches = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)];
      for (const m of matches) {
        if (PRODUCT_DOMAINS.some((d) => m[1].includes(d))) {
          return m[1];
        }
      }
    } catch (e: any) {
      this.logger.warn(`Yandex text search failed: ${e.message}`);
    }

    return null;
  }

  /**
   * Открывает страницу товара и извлекает главное изображение.
   * Сначала пробует og:image, затем ищет крупные <img>.
   */
  private async extractProductImage(pageUrl: string): Promise<string | null> {
    await assertPublicHttpUrl(pageUrl);
    const { data: html } = await axios.get(pageUrl, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
      timeout: 15_000,
    });

    // og:image — самый надёжный источник
    const og =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    if (og && og.startsWith('http')) return og;

    // Яндекс.Маркет CDN — товарные фото на белом фоне
    const marketImg = html.match(/(https:\/\/avatars\.mds\.yandex\.net\/get-mpic\/[^\s"']+\/orig)/)?.[1];
    if (marketImg) return marketImg;

    // DNS CDN
    const dnsImg = html.match(/(https:\/\/[a-z]\.dns-shop\.ru\/thumb\/[^\s"']+)/)?.[1];
    if (dnsImg) return dnsImg;

    return null;
  }

  // ── Fallback: прямой поиск изображений ──────────────────────────

  private async searchImages(query: string): Promise<string[]> {
    for (const [name, fn] of [
      ['DuckDuckGo', () => this.duckDuckGoImages(query)],
      ['Bing',       () => this.bingImages(query)],
      ['Yandex',     () => this.yandexImages(query)],
    ] as [string, () => Promise<string[]>][]) {
      try {
        const urls = await fn();
        this.logger.log(`${name}: ${urls.length} images`);
        if (urls.length > 0) return urls;
      } catch (e: any) {
        this.logger.warn(`${name} error: ${e.message}`);
      }
    }
    return [];
  }

  private async duckDuckGoImages(query: string): Promise<string[]> {
    const { data: html } = await axios.get('https://duckduckgo.com/', {
      params: { q: query, iax: 'images', ia: 'images' },
      headers: { 'User-Agent': UA, Accept: 'text/html', 'Accept-Language': 'en-US,en;q=0.9' },
      timeout: 12_000,
    });
    const vqd =
      html.match(/vqd=['"]([^'"]+)['"]/)?.[1] ||
      html.match(/"vqd":"([^"]+)"/)?.[1];
    if (!vqd) throw new Error('vqd token not found');

    const { data } = await axios.get('https://duckduckgo.com/i.js', {
      params: { q: query, vqd, o: 'json', p: '1', s: '0', u: 'bing', f: ',,,,,', l: 'en-us' },
      headers: {
        'User-Agent': UA,
        Referer: 'https://duckduckgo.com/',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: 12_000,
    });
    return (data?.results ?? []).map((r: any) => r.image as string).filter(Boolean);
  }

  private async bingImages(query: string): Promise<string[]> {
    const { data: html } = await axios.get('https://www.bing.com/images/search', {
      params: { q: query, first: 1, count: 15 },
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Referer: 'https://www.bing.com/',
        Cookie: 'SRCHHPGUSR=SRCHLANG=en',
      },
      timeout: 15_000,
    });
    for (const pat of [/"murl":"(https?:\/\/[^"]+)"/g, /"imgurl":"(https?:\/\/[^"]+)"/g]) {
      const m = [...html.matchAll(pat)];
      if (m.length > 0) return m.map((x) => decodeURIComponent(x[1])).filter(Boolean);
    }
    return [];
  }

  private async yandexImages(query: string): Promise<string[]> {
    const { data: html } = await axios.get('https://yandex.ru/images/search', {
      params: { text: query, rpt: 'image', nomisspell: 1, isize: 'large' },
      headers: {
        'User-Agent': UA,
        Accept: 'text/html',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        Referer: 'https://yandex.ru/',
      },
      timeout: 15_000,
    });

    // Яндекс.Маркет CDN — гарантированно товарные фото
    const market = [...html.matchAll(/"(https:\/\/avatars\.mds\.yandex\.net\/get-mpic\/[^"]+)"/g)]
      .map((m) => m[1].replace(/\/[a-z0-9]+$/, '/orig'))
      .filter(Boolean);
    if (market.length > 0) return [...new Set(market)];

    return [...html.matchAll(/"orig_url":"(https?:\/\/[^"]+)"/g)]
      .map((m) => m[1])
      .filter((u) => PRODUCT_DOMAINS.some((d) => u.includes(d)));
  }

  // ── Download & upload ────────────────────────────────────────────

  private async download(url: string): Promise<Buffer> {
    await assertPublicHttpUrl(url);
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 12_000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechnicsBot/1.0)' },
      maxRedirects: 5,
    });
    const buf = Buffer.from(data);
    if (buf.length < 5_000) throw new Error('Слишком маленький файл');
    return buf;
  }

  private upload(buffer: Buffer, productId: number): Promise<string> {
    cloudinary.config({
      cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
      api_key:    requireEnv('CLOUDINARY_API_KEY'),
      api_secret: requireEnv('CLOUDINARY_API_SECRET'),
    });
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder:         'technics/products',
          public_id:      `product_${productId}_${Date.now()}`,
          resource_type:  'image',
          format:         'webp',
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
        },
        (err, result) => (err ? reject(err) : resolve(result!.secure_url)),
      );
      stream.end(buffer);
    });
  }
}
