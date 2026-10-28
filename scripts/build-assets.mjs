// Post-build assets, rendered from the built site with headless Chromium:
//   dist/cv/ender-aygun-cv-{tr,en}.pdf  — A4 CV from the page's own print CSS
//   dist/og/cv-{tr,en}.png              — 1200x630 social preview from /og/<lang>/
// Runs after `astro build` (see package.json "build"), so both always match the data.
// Then it checks that no image on any page is cropped (desktop + phone widths); a cropped
// image fails the build. Decorative fills (FitImage's blur layer) carry data-fill and are skipped.
import { createServer } from 'node:http';
import { readdir, readFile, rm, stat } from 'node:fs/promises';
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
  '.jpg': 'image/jpeg',
  '.webm': 'video/webm',
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

  // Crop check: every <img> must show the whole picture.
  const pages = [];
  const walk = async (dir, url) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      if (e.isDirectory()) await walk(join(dir, e.name), `${url}${e.name}/`);
      else if (e.name === 'index.html') pages.push(url);
    }
  };
  await walk(dist, '/');
  const crops = [];
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const view = await browser.newPage({ viewport });
    for (const path of pages) {
      await view.goto(base + path, { waitUntil: 'networkidle' });
      const found = await view.evaluate(async () => {
        // collapsed READMEs hide their lower half on purpose ("show more"); that is not a crop
        document.querySelectorAll('.readme-wrap.is-collapsed').forEach((w) => w.classList.remove('is-collapsed'));
        const imgs = [...document.querySelectorAll('img')].filter((i) => !i.closest('[data-fill]'));
        await Promise.all(imgs.map((i) => ((i.loading = 'eager'), i.decode().catch(() => {}))));
        const out = [];
        for (const img of imgs) {
          const r = img.getBoundingClientRect();
          if (!r.width || !r.height || !img.naturalWidth) continue;
          const name = img.currentSrc.split('/').pop().split('?')[0];
          const fit = getComputedStyle(img).objectFit;
          const nat = img.naturalWidth / img.naturalHeight;
          const box = r.width / r.height;
          // anything but contain crops (cover) or distorts (fill) once the box ratio differs
          if (fit !== 'contain' && Math.abs(box - nat) / nat > 0.02)
            out.push(`${name}: object-fit ${fit}, box ${box.toFixed(2)} vs image ${nat.toFixed(2)}`);
          for (let p = img.parentElement; p && p !== document.body; p = p.parentElement) {
            const cs = getComputedStyle(p);
            if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
            const q = p.getBoundingClientRect();
            if (r.left < q.left - 1 || r.top < q.top - 1 || r.right > q.right + 1 || r.bottom > q.bottom + 1) {
              out.push(`${name}: clipped by ${p.tagName.toLowerCase()}.${[...p.classList].join('.')}`);
              break;
            }
          }
        }
        return out;
      });
      for (const c of found) crops.push(`${viewport.width}px ${path} ${c}`);
    }
    await view.close();
  }
  if (crops.length) {
    console.error(`  cropped images (${crops.length}):\n    ${crops.join('\n    ')}`);
    process.exitCode = 1;
  } else console.log(`  ok   no cropped images (${pages.length} pages, 2 widths)`);
} finally {
  await browser.close();
  server.close();
}
