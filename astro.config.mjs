// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://pandomentall.github.io',
  trailingSlash: 'always',
  // The games list became the Tuz Limon page; old links must keep working (Pages has no server redirects).
  redirects: {
    '/oyunlar/': '/tuzlimon/',
    '/en/games/': '/en/tuzlimon/',
  },
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'tr', locales: { tr: 'tr-TR', en: 'en-US' } },
      // /og/<lang>/ only exists to be screenshotted into the social card.
      // The blog is a "coming soon" page until the first post: keep it out until then.
      filter: (page) => !page.includes('/og/') && !/\/blog\/$/.test(page),
    }),
  ],
});
