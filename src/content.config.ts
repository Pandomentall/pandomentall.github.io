import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Layout:
//   src/content/blog/{tr,en}/<slug>.md                 one file per language, linked by translationKey
//   src/content/projects/<slug>/{tr,en}.md + images    tech zone (tiles → detail page)
//   src/content/games/<slug>/{tr,en}.md + images       game zone (rows → detail page)
// A project/game must exist in both languages (detail pages link to each other).
// The markdown body is our own long description; `repo` + `readme` pull the GitHub README
// in at build time (src/lib/github.ts).

const lang = z.enum(['tr', 'en']);
const status = z.enum(['active', 'released', 'prototype', 'paused', 'archived']);

const links = z
  .object({
    repo: z.url().optional(),
    site: z.url().optional(),
    itch: z.url().optional(),
    steam: z.url().optional(),
    download: z.url().optional(),
  })
  .default({});

const common = (image: SchemaContext['image']) => ({
  title: z.string(),
  summary: z.string(),
  lang,
  status,
  order: z.number().default(100),
  tags: z.array(z.string()).default([]),
  links,
  // Public GitHub repo ("owner/name") and which README file to show on this language's page.
  repo: z.string().optional(),
  readme: z.string().optional(),
  readmeLang: lang.optional(),
  team: z.array(z.object({ name: z.string(), role: z.string() })).default([]),
  gallery: z.array(z.object({ src: image(), alt: z.string() })).default([]),
  // Row card: wide image, frame/glow colours in the item's own style, hover particle effect.
  thumb: image().optional(),
  accent: z.tuple([z.string(), z.string()]).default(['#8cc8ec', '#a8cfae']),
  fx: z.enum(['flame', 'siren', 'stars', 'matrix', 'typing', 'parlamonium', 'rating']).optional(),
  // Short achievement line shown on the card and detail hero (e.g. a jam placement).
  award: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '{tr,en}/**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      lang,
      translationKey: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      // Slug of a project or game this post belongs to; listed on that detail page.
      about: z.string().optional(),
      zone: z.enum(['cv', 'game', 'tech']).default('cv'),
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/{tr,en}.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      ...common(image),
      kind: z.enum(['software', 'tool', 'localization', 'web', 'other']),
      logo: image().optional(),
      // Fallback tile when there is no logo image.
      monogram: z.object({ text: z.string().max(3), color: z.string() }).optional(),
    }),
});

const games = defineCollection({
  loader: glob({ pattern: '*/{tr,en}.md', base: './src/content/games' }),
  schema: ({ image }) =>
    z.object({
      ...common(image),
      genre: z.string(),
      engine: z.string().optional(),
      platforms: z.array(z.string()).default([]),
      jam: z.string().optional(),
      // Code-drawn art for games without publishable media (see GameArt.astro).
      art: z.enum(['ellam']).optional(),
      backdrop: z.enum(['grid', 'parlamonium']).default('grid'),
    }),
});

export const collections = { blog, projects, games };
