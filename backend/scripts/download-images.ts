import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import axios from 'axios';
// @ts-ignore
import { chromium } from 'playwright-extra';
// @ts-ignore
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

chromium.use(StealthPlugin());

const IMAGES_DIR = path.resolve(__dirname, '../../frontend/public/products');
const DB_URL_PREFIX = '/products/';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:yandexpraktikum@localhost:5432/technics' });
const prisma = new PrismaClient({ adapter } as any);

/** Build a short model-focused search query: "Dahua IPC-HDW1439T1-LED" */
function buildQuery(brandName: string, productName: string): string {
  const base = productName.split('(')[0].trim();
  const words = base.split(/\s+/);
  return words.slice(0, 3).join(' ');
}

/** Search Bing Images and return full-size image URLs */
async function searchBingImages(page: any, query: string): Promise<string[]> {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);

  const urls: string[] = await page.evaluate(() => {
    const found: string[] = [];
    // Bing stores full image URLs in JSON on .iusc elements (m attribute)
    for (const el of document.querySelectorAll('.iusc')) {
      const m = el.getAttribute('m') ?? '';
      try {
        const data = JSON.parse(m);
        if (data.murl && data.murl.match(/\.(jpg|jpeg|png|webp)/i)) {
          found.push(data.murl);
        }
      } catch {}
    }
    return [...new Set(found)].slice(0, 8);
  });

  return urls;
}

/** Download image bytes to file */
async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxContentLength: 15_000_000,
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bing.com/',
      },
    });
    const ct = (res.headers['content-type'] as string) ?? '';
    if (!ct.startsWith('image/')) return false;
    const buf = Buffer.from(res.data);
    if (buf.length < 2000) return false;
    fs.writeFileSync(filepath, buf);
    return true;
  } catch {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    return false;
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const products = await prisma.product.findMany({
    include: { images: true, brand: true },
    orderBy: { id: 'asc' },
  });

  const start = parseInt(process.env.START_INDEX ?? '0');
  const end   = parseInt(process.env.END_INDEX   ?? String(products.length));
  const batch = products.slice(start, end);

  console.log(`📦 Товаров: ${batch.length} (${start}–${end} из ${products.length})`);
  console.log(`📁 Папка:   ${IMAGES_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'en-US',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 900 },
  });
  let page = await context.newPage();

  let ok = 0, fail = 0, skip = 0;

  for (let i = 0; i < batch.length; i++) {
    const product = batch[i];
    const idx     = start + i + 1;
    const mainImg = product.images.find(img => img.isMain) ?? product.images[0];

    if (!mainImg) { skip++; continue; }
    if (!mainImg.url.includes('placehold.co')) { skip++; continue; }

    const slug     = product.slug;
    const filepath = path.join(IMAGES_DIR, `${slug}.jpg`);

    if (fs.existsSync(filepath)) {
      await prisma.productImage.update({ where: { id: mainImg.id }, data: { url: `${DB_URL_PREFIX}${slug}.jpg` } });
      skip++;
      continue;
    }

    const query = buildQuery(product.brand?.name ?? '', product.name);
    process.stdout.write(`[${idx}/${products.length}] ${query.padEnd(45)} `);

    let imageUrls: string[] = [];
    try {
      imageUrls = await searchBingImages(page, query);
    } catch (err: any) {
      // Connection error — recreate page and retry once
      try {
        await page.close();
        page = await context.newPage();
        await sleep(5000);
        imageUrls = await searchBingImages(page, query);
      } catch {
        imageUrls = [];
      }
    }

    let downloaded = false;
    for (const imgUrl of imageUrls) {
      downloaded = await downloadImage(imgUrl, filepath);
      if (downloaded) break;
      await sleep(300);
    }

    if (downloaded) {
      await prisma.productImage.update({
        where: { id: mainImg.id },
        data: { url: `${DB_URL_PREFIX}${slug}.jpg` },
      });
      console.log('✅');
      ok++;
    } else {
      console.log('❌  не скачалось');
      fail++;
    }

    await sleep(3000);

    if ((i + 1) % 40 === 0) {
      console.log(`\n⏸  Пауза 45 секунд...\n`);
      await sleep(45000);
    }
  }

  await browser.close();

  console.log(`\n✅ Готово:`);
  console.log(`   Скачано:   ${ok}`);
  console.log(`   Ошибки:    ${fail}`);
  console.log(`   Пропущено: ${skip}`);
  if (fail > 0 || ok > 0) {
    console.log(`\n💡 Продолжить с: $env:START_INDEX="${start + ok + fail + skip}"`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
