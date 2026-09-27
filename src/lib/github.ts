// Build-time GitHub data for project/game detail pages: repo facts, latest release,
// total downloads and a README rendered to HTML. Public repos only.
//
// - Token: GITHUB_TOKEN env if present (CI passes it; locally `GITHUB_TOKEN=$(gh auth token)`),
//   otherwise unauthenticated (60 req/h).
// - Cache: .cache/github/*.json for 1 hour, so repeated local builds don't hit the rate limit.
// - Failure never breaks the build: the page renders without the GitHub section.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';

export interface RepoInfo {
  url: string;
  description: string | null;
  license: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  homepage: string | null;
  pushedAt: string;
  release: { tag: string; url: string; date: string; downloads: number } | null;
}

const CACHE_DIR = join(process.cwd(), '.cache', 'github');
const TTL = 60 * 60 * 1000;

async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const file = join(CACHE_DIR, key.replace(/[^a-z0-9._-]/gi, '_') + '.json');
  try {
    const hit = JSON.parse(await readFile(file, 'utf8'));
    if (Date.now() - hit.at < TTL) return hit.value as T;
  } catch {
    /* miss */
  }
  const value = await load();
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(file, JSON.stringify({ at: Date.now(), value }));
  return value;
}

async function api<T>(path: string, accept = 'application/vnd.github+json'): Promise<T | null> {
  const headers: Record<string, string> = { accept, 'user-agent': 'pandomentall.github.io build' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return (accept.includes('raw') ? await res.text() : await res.json()) as T;
}

export async function getRepo(repo: string): Promise<RepoInfo | null> {
  try {
    return await cached(`repo-${repo}`, async () => {
      const r = await api<any>(`/repos/${repo}`);
      if (!r) return null;
      const rel = await api<any>(`/repos/${repo}/releases/latest`);
      return {
        url: r.html_url,
        description: r.description,
        license: r.license?.spdx_id ?? null,
        language: r.language,
        topics: r.topics ?? [],
        stars: r.stargazers_count,
        homepage: r.homepage || null,
        pushedAt: r.pushed_at,
        release: rel
          ? {
              tag: rel.tag_name,
              url: rel.html_url,
              date: rel.published_at,
              downloads: (rel.assets ?? []).reduce((n: number, a: any) => n + a.download_count, 0),
            }
          : null,
      } satisfies RepoInfo;
    });
  } catch (e) {
    console.warn(`[github] ${repo}: ${(e as Error).message} — rendering without repo data`);
    return null;
  }
}

// README → HTML. Relative links/images are resolved against the repo, the first <h1> and the
// README's own language switcher are dropped (the detail page has its own title and switch).
export async function getReadmeHtml(repo: string, file: string, branch = 'main'): Promise<string | null> {
  try {
    const md = await cached(`readme-${repo}-${file}`, () =>
      api<string>(`/repos/${repo}/contents/${file}`, 'application/vnd.github.raw+json'),
    );
    if (!md) return null;
    const blob = `https://github.com/${repo}/blob/${branch}/`;
    const raw = `https://raw.githubusercontent.com/${repo}/${branch}/`;
    const marked = new Marked({ gfm: true }, gfmHeadingId());
    let html = await marked.parse(md);

    html = html
      .replace(/<h1[^>]*>[\s\S]*?<\/h1>/, '')
      .replace(/<p>[^<]*(<strong>[^<]*<\/strong>|<a [^>]*>[^<]*<\/a>)\s*·\s*<a href="README(\.[a-z]{2})?\.md">[\s\S]*?<\/p>/i, '')
      .replace(/\s(src|href)="([^"]+)"/g, (_, attr: string, url: string) => {
        if (/^(https?:|mailto:|#|data:)/.test(url)) return ` ${attr}="${url}"`;
        return ` ${attr}="${new URL(url, attr === 'src' ? raw : blob).href}"`;
      })
      // External links open in a new tab; in-page anchors stay.
      .replace(/<a href="(https?:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener"')
      .replace(/<img /g, '<img loading="lazy" decoding="async" ');
    return html;
  } catch (e) {
    console.warn(`[github] ${repo}/${file}: ${(e as Error).message} — README skipped`);
    return null;
  }
}
