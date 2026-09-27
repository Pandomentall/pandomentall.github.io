// Helpers shared by the projects and games list/detail pages.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type WorkKind = 'projects' | 'games';
export type Work = CollectionEntry<'projects'> | CollectionEntry<'games'>;

// Entry ids look like "raporgo/tr"; the folder name is the URL slug.
export const slugOf = (entry: { id: string }) => entry.id.split('/')[0];

export async function listWorks<K extends WorkKind>(kind: K, lang: Lang): Promise<CollectionEntry<K>[]> {
  const all = (await getCollection(kind)) as CollectionEntry<K>[];
  return all
    .filter((e) => e.data.lang === lang)
    .sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, lang));
}

// Static paths for /<route>/[slug] in one language, with prev/next neighbours.
export async function workPaths(kind: WorkKind, lang: Lang) {
  const items = await listWorks(kind, lang);
  return items.map((entry, i) => ({
    params: { slug: slugOf(entry) },
    props: { entry, prev: items[i - 1] ?? null, next: items[i + 1] ?? null },
  }));
}

// Loaded once per build (an empty blog collection would otherwise warn on every page).
let allPosts: Promise<CollectionEntry<'blog'>[]> | undefined;
export async function postsAbout(slug: string, lang: Lang) {
  allPosts ??= getCollection('blog');
  return (await allPosts)
    .filter((p) => p.data.lang === lang && p.data.about === slug && !p.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
