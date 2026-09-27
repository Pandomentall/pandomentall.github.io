// Structured data (JSON-LD) so search engines can tell who "Ender Aygün" on this site is,
// and tie this site to his profiles elsewhere (sameAs). Rendered on the home page (Person +
// WebSite) and the CV page (ProfilePage around the same Person). No email or phone here.
import { getImage } from 'astro:assets';
import photo from '../assets/ender.png';
import { person } from '../data/cv';
import { activeSocials, site } from '../data/site';
import { pathFor, type Lang } from '../i18n/ui';

const PERSON_ID = `${site.url}/#person`;
const SITE_ID = `${site.url}/#website`;

export async function personGraph(lang: Lang, page: 'home' | 'cv') {
  const image = await getImage({ src: photo, width: 400, height: 400, format: 'jpeg' });
  const url = (path: string) => new URL(path, site.url).href;

  const personNode = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: person.name,
    // Common ways people type the name without Turkish characters, plus the online handle.
    alternateName: ['Ender Aygun', 'Pandomental'],
    url: url('/'),
    image: url(image.src),
    jobTitle: person.title[lang],
    description:
      lang === 'tr'
        ? 'Yazılım ve oyun geliştirici: yazılım, oyun, modlama ve topluluk araçları.'
        : 'Software and game developer: software, games, modding and community tools.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bandırma',
      addressRegion: 'Balıkesir',
      addressCountry: 'TR',
    },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Beykoz Üniversitesi' },
    knowsAbout: ['Software development', 'Game development', 'Unity', 'JavaScript', 'Game localization'],
    sameAs: activeSocials.map((s) => s.url),
  };

  const graph: Record<string, unknown>[] = [personNode];
  if (page === 'home') {
    graph.push({
      '@type': 'WebSite',
      '@id': SITE_ID,
      name: person.name,
      url: url('/'),
      inLanguage: ['tr', 'en'],
      author: { '@id': PERSON_ID },
    });
  } else {
    graph.push({
      '@type': 'ProfilePage',
      url: url(pathFor('cv', lang)),
      inLanguage: lang,
      name: `${person.name} — CV`,
      mainEntity: { '@id': PERSON_ID },
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
