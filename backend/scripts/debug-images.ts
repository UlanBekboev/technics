import * as fs from 'fs';
import * as https from 'https';
import axios from 'axios';
// @ts-ignore
import { chromium } from 'playwright-extra';
// @ts-ignore
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function testBing() {
  console.log('=== Test 1: Bing Images via HTTP (no browser) ===');
  try {
    const query = 'Dahua IPC-HDW1439T1-LED camera';
    const res = await axios.get(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`, {
      httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
      timeout: 15000,
    });
    const html = res.data as string;
    console.log('HTML length:', html.length);
    // Bing embeds image URLs in murl= or imgurl= attributes, or in JSON
    const murlMatches = [...html.matchAll(/murl&quot;:&quot;(https?:[^&]+\.(?:jpg|jpeg|png|webp))/gi)].slice(0, 5);
    console.log('murl matches:', murlMatches.length);
    murlMatches.forEach((m, i) => console.log(`  [${i}] ${decodeURIComponent(m[1]).slice(0, 100)}`));

    const imgurlMatches = [...html.matchAll(/"murl":"(https?:[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)].slice(0, 5);
    console.log('JSON murl matches:', imgurlMatches.length);
    imgurlMatches.forEach((m, i) => console.log(`  [${i}] ${m[1].slice(0, 100)}`));

    // Save HTML snippet
    const idx = html.indexOf('murl');
    if (idx > 0) console.log('HTML around murl:', html.slice(Math.max(0, idx-20), idx+200));
  } catch (e: any) { console.log('Error:', e.message); }
}

async function testBingBrowser() {
  console.log('\n=== Test 2: Bing Images via Playwright ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'en-US',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  const query = 'Dahua IPC-HDW1439T1-LED';
  await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2`, {
    waitUntil: 'domcontentloaded', timeout: 20000,
  });
  await page.waitForTimeout(2000);

  const title = await page.title();
  console.log('Title:', title);

  await page.screenshot({ path: 'C:/Users/user/dev/technics/debug-bing.png' });
  console.log('Screenshot saved: debug-bing.png');

  // Extract image URLs from Bing
  const urls = await page.evaluate(() => {
    const found: string[] = [];
    // Bing stores image URLs in data-src or m attribute on .iusc elements
    for (const el of document.querySelectorAll('.iusc, [m]')) {
      const m = el.getAttribute('m') ?? '';
      try {
        const data = JSON.parse(m);
        if (data.murl) found.push(data.murl);
      } catch {}
    }
    // Also try img tags
    for (const img of document.querySelectorAll('.mimg')) {
      const src = (img as HTMLImageElement).src;
      if (src && src.startsWith('http') && !src.includes('bing.com')) found.push(src);
    }
    return [...new Set(found)].slice(0, 10);
  });

  console.log('Image URLs found:', urls.length);
  urls.slice(0, 5).forEach((u, i) => console.log(`  [${i}] ${u.slice(0, 100)}`));

  if (urls.length > 0) {
    console.log('\nTesting download of first URL...');
    try {
      const res = await axios.get(urls[0], {
        responseType: 'arraybuffer', timeout: 10000, httpsAgent,
        headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bing.com/' },
      });
      const buf = Buffer.from(res.data);
      console.log('Downloaded:', buf.length, 'bytes, type:', res.headers['content-type']);
      if (buf.length > 2000) {
        fs.mkdirSync('C:/Users/user/dev/technics/frontend/public/products', { recursive: true });
        fs.writeFileSync('C:/Users/user/dev/technics/frontend/public/products/_test_bing.jpg', buf);
        console.log('Saved _test_bing.jpg ✅');
      }
    } catch (e: any) { console.log('Download error:', e.message); }
  }

  await browser.close();
}

async function main() {
  await testBing();
  await testBingBrowser();
}

main().catch(console.error);
