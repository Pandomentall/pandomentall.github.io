// Post-build assets, rendered from the built site with headless Chromium:
//   dist/cv/ender-aygun-cv-{tr,en}.pdf  — A4 CV from the page's own print CSS
//   dist/og/cv-{tr,en}.png              — 1200x630 social preview from /og/<lang>/
// Runs after `astro build` (see package.json "build"), so both always match the data.
import { createServer } from 'node:http';
import { readFile, rm, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const dist = resolve('dist');
const pdfs = [
  { path: '/cv/', out: 'cv/ender-aygun-cv-tr.pdf' },
  { path: '/en/cv/', out: 'cv/ender-aygun-cv-en.pdf' },
];
const ogs = [
  { path: '/og/tr/', out: 'og/cv-tr.png' },
  { path: '/og/en/', out: 'og/cv-en.png' },
];

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

// Minimal static server: absolute asset URLs (/_astro/...) don't resolve over file://.
const server = createServer(async (req, res) => {
  try {
    let file = join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const { path, out } of pdfs) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Collapsed <details> content must be in the PDF too.
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
    await page.pdf({ path: join(dist, out), preferCSSPageSize: true, printBackground: true });
    console.log(`  pdf  ${out}`);
  }

  const card = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const { path, out } of ogs) {
    await card.goto(base + path, { waitUntil: 'networkidle' });
    await card.evaluate(() => document.fonts.ready);
    await card.screenshot({ path: join(dist, out) });
    console.log(`  png  ${out}`);
  }
  // The card pages only exist to be screenshotted.
  await rm(join(dist, 'og', 'tr'), { recursive: true, force: true });
  await rm(join(dist, 'og', 'en'), { recursive: true, force: true });
} finally {
  await browser.close();
  server.close();
}
