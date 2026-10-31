export const locales = ['tr', 'en'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'tr';

// Every user-facing text in the site exists in both languages.
// Shape: { key: { tr, en } } — a missing language is a type error, so the build fails.
export type L = Record<Lang, string>;
// Proper nouns and tech names stay a plain string; anything translatable is an L.
export type Text = string | L;
export function tx(v: Text, lang: Lang): string {
  return typeof v === 'string' ? v : v[lang];
}

// Route slugs per language. Pages pass their RouteKey to the layout so the
// language switch can jump to the same page in the other language.
export const routes = {
  home: { tr: '', en: '' },
  cv: { tr: 'cv', en: 'cv' },
  projects: { tr: 'projeler', en: 'projects' },
  games: { tr: 'oyunlar', en: 'games' },
  blog: { tr: 'blog', en: 'blog' },
  tuzlimon: { tr: 'tuzlimon', en: 'tuzlimon' },
} satisfies Record<string, L>;
export type RouteKey = keyof typeof routes;

// `item` = detail page slug under a list route (e.g. /projeler/raporgo).
export function pathFor(key: RouteKey, lang: Lang, item?: string): string {
  const base = routes[key][lang];
  const path = item ? `${base}/${item}` : base;
  // Always end with "/": GitHub Pages serves /cv/ and 301-redirects /cv.
  if (!path) return lang === defaultLang ? '/' : `/${lang}/`;
  return lang === defaultLang ? `/${path}/` : `/${lang}/${path}/`;
}

export const ui = {
  'nav.home': { tr: 'Ana sayfa', en: 'Home' },
  'nav.cv': { tr: 'CV', en: 'CV' },
  'nav.projects': { tr: 'Projeler', en: 'Projects' },
  'nav.games': { tr: 'Oyunlar', en: 'Games' },
  'nav.blog': { tr: 'Blog', en: 'Blog' },
  'nav.skip': { tr: 'İçeriğe geç', en: 'Skip to content' },
  'lang.switchLabel': { tr: 'Sayfanın İngilizce sürümü', en: 'Turkish version of this page' },

  'cv.pageTitle': { tr: 'Ender Aygün | CV', en: 'Ender Aygün | CV' },
  'cv.description': {
    tr: 'Ender Aygün: yazılım ve oyun geliştirici. İş deneyimi, projeler, eğitim.',
    en: 'Ender Aygün: software and game developer. Experience, projects, education.',
  },
  'cv.downloadPdf': { tr: 'PDF indir', en: 'Download PDF' },
  'cv.copyEmail': { tr: 'Kopyala', en: 'Copy' },
  'cv.copied': { tr: 'Kopyalandı', en: 'Copied' },
  'cv.shippedModulesTitle': { tr: 'Canlıya Aldığım Modüller', en: 'Modules I Shipped to Production' },
  'cv.referencesNote': {
    tr: 'İletişim bilgileri talep üzerine paylaşılır.',
    en: 'Contact details available on request.',
  },

  'soon.title': { tr: 'Yakında', en: 'Coming soon' },
  'soon.back': { tr: 'CV sayfasına dön', en: 'Back to the CV' },

  'home.title': { tr: 'Ender Aygün - Yazılım Geliştiricisi', en: 'Ender Aygün - Software Developer' },
  'home.description': {
    tr: 'Ender Aygün: yazılım ve oyun geliştirici. CV, projeler, oyunlar ve yazılar.',
    en: 'Ender Aygün: software and game developer. CV, projects, games and writing.',
  },
  'home.hello': { tr: 'Merhaba, ben', en: 'Hi, I am' },
  'home.intro': {
    tr: 'Teknolojik her alanda meraklı ve çok yönlü bir geliştiriciyim: yazılım, oyun, modlama ve community tool’lar üzerinde çalışıyorum.',
    en: 'A curious, versatile developer across every corner of technology: I work on software, games, modding and community tools.',
  },
  'home.seeCv': { tr: 'CV’ye göz at', en: 'See the CV' },
  'home.foldersTitle': { tr: 'Neler var?', en: 'What is inside?' },
  'home.folder.cv': { tr: 'Deneyimlerim ve Eğitimim', en: 'My Experience and Education' },
  'home.folder.projects': { tr: 'Geliştirdiğim Yazılımlar ve Yamalar', en: 'Software and Patches I Built' },
  'home.folder.games': { tr: 'Geliştirdiğim Dijital Oyunlar', en: 'Digital Games I Made' },
  'home.folder.blog': { tr: 'Yazılarım ve Geliştirme Günlüklerim', en: 'My Writing and Devlogs' },
  'home.count.projects': { tr: 'proje', en: 'projects' },
  'home.count.games': { tr: 'oyun', en: 'games' },
  'home.count.cv': { tr: '2 sayfa · TR / EN', en: '2 pages · TR / EN' },
  'home.count.blog': { tr: 'yakında', en: 'soon' },
  'home.open': { tr: 'Aç', en: 'Open' },
  'home.outroTitle': { tr: 'Bir fikrin mi var?', en: 'Got an idea?' },
  'home.outroBody': {
    tr: 'Ekip olalım, geliştirelim, geliştireyim; hangisi sana uygunsa.',
    en: 'Let’s team up, build it together, or I build it for you; whichever suits you.',
  },

  'studio.meta': {
    tr: 'Tuz Limon: bağımsız oyunların tekilası. Leeway: Lightkeeper 2027’nin ilk çeyreğinde, jam oyunları yayında.',
    en: 'Tuz Limon: the tequila of indie games. Leeway: Lightkeeper in Q1 2027, jam games out now.',
  },
  'studio.tag': { tr: 'Bağımsız oyunların tekilası.', en: 'Tequila of indie games.' },
  'studio.tag2': { tr: 'En iyisi tuz ve limonla.', en: 'Best served with salt and lemon.' },
  'studio.nav.games': { tr: 'Oyunlar', en: 'Games' },
  'studio.nav.collab': { tr: 'İş birliği', en: 'Work with us' },
  'studio.nav.press': { tr: 'Basın', en: 'Press' },
  'studio.now': { tr: 'Yakında 2027 1. Çeyrek', en: 'Coming Q1 2027' },
  'studio.with': { tr: 'Vormela Interactive x Tuz Limon', en: 'Vormela Interactive x Tuz Limon' },
  'studio.wishlist': { tr: 'Steam’de istek listene ekle', en: 'Wishlist on Steam' },
  'studio.details': { tr: 'Oyunun sayfası', en: 'Game page' },
  'studio.earlier': { tr: 'Önceki oyunlar', en: 'Earlier games' },
  'studio.collab': { tr: 'Birlikte çalışalım', en: 'Work with us' },
  'studio.collab.lead': {
    tr: 'Ekibe katılmak ya da oyunlarımızı yayınlamak için.',
    en: 'To join the team or to publish our games.',
  },
  'studio.collab.team': { tr: 'Ekip Arkadaşı', en: 'Teammate' },
  'studio.collab.team.body': {
    tr: 'Beraber proje yapalım, projene katkıda bulunayım ya da sadece sohbet edelim. Bana yaz!',
    en: 'Let’s build a project together, let me contribute to yours, or let’s just chat. Write to me!',
  },
  'studio.collab.publish': { tr: 'Yayın', en: 'Publishing' },
  'studio.collab.publish.body': {
    tr: 'Leeway: Lightkeeper 2027’nin ilk çeyreğine hazırlanıyor. Yayın görüşmelerine açığız.',
    en: 'Leeway: Lightkeeper is heading for Q1 2027. We are open to publishing talks.',
  },
  'studio.press': { tr: 'Basın', en: 'Press' },
  'studio.press.body': {
    tr: 'Logolar, maskot, renkler ve kullanım kuralları tek dosyada.',
    en: 'Logos, mascot, colours and usage rules in one file.',
  },
  'studio.press.get': { tr: 'Basın kitini indir', en: 'Download the press kit' },
  'studio.contact': { tr: 'İletişim', en: 'Contact' },
  'studio.site': { tr: 'Ender Aygün’ün sitesi', en: 'Ender Aygün’s site' },

  'projects.title': { tr: 'Projeler', en: 'Projects' },
  'projects.lead': {
    tr: 'Açık kaynak yazılımlar, oyun yamaları ve küçük web işleri.',
    en: 'Open-source software, game patches and small web work.',
  },

  'blog.title': { tr: 'Blog', en: 'Blog' },
  'blog.lead': {
    tr: 'Oyun tasarımı, geliştirme günlükleri ve araç yaparken öğrendiklerim.',
    en: 'Game design, devlogs and what I learn while building tools.',
  },

  'status.active': { tr: 'Geliştiriliyor', en: 'In development' },
  'status.released': { tr: 'Yayında', en: 'Released' },
  'status.prototype': { tr: 'Prototip', en: 'Prototype' },
  'status.paused': { tr: 'Beklemede', en: 'On hold' },
  'status.archived': { tr: 'Arşivde', en: 'Archived' },

  'detail.back.projects': { tr: 'Tüm projeler', en: 'All projects' },
  'detail.back.games': { tr: 'Tüm oyunlar', en: 'All games' },
  'detail.prev': { tr: 'Önceki', en: 'Previous' },
  'detail.next': { tr: 'Sonraki', en: 'Next' },
  'detail.about': { tr: 'Hakkında', en: 'About' },
  'detail.gallery': { tr: 'Görseller', en: 'Gallery' },
  'detail.clips': { tr: 'Oynanış', en: 'Gameplay' },
  'detail.team': { tr: 'Ekip', en: 'Team' },
  'detail.posts': { tr: 'İlgili yazılar', en: 'Related posts' },
  'detail.readme': { tr: 'GitHub’dan', en: 'From GitHub' },
  'detail.readmeOtherLang': {
    tr: 'README yalnızca İngilizce.',
    en: 'The README is only available in Turkish.',
  },
  'detail.readmeMore': { tr: 'README’nin tamamını göster', en: 'Show the full README' },
  'detail.readmeLess': { tr: 'Daralt', en: 'Collapse' },
  'detail.repo': { tr: 'GitHub', en: 'GitHub' },
  'detail.download': { tr: 'İndir', en: 'Download' },
  'detail.site': { tr: 'Tanıtım sayfası', en: 'Website' },
  'detail.itch': { tr: 'itch.io’da oyna', en: 'Play on itch.io' },
  'detail.steam': { tr: 'Steam', en: 'Steam' },
  'fact.license': { tr: 'Lisans', en: 'License' },
  'fact.release': { tr: 'Son sürüm', en: 'Latest release' },
  'fact.downloads': { tr: 'İndirme', en: 'Downloads' },
  'fact.language': { tr: 'Dil', en: 'Language' },
  'fact.genre': { tr: 'Tür', en: 'Genre' },
  'fact.engine': { tr: 'Motor', en: 'Engine' },
  'fact.platforms': { tr: 'Platform', en: 'Platforms' },
  'fact.jam': { tr: 'Jam', en: 'Jam' },
  'fact.kind': { tr: 'Tür', en: 'Type' },
  'kind.software': { tr: 'Yazılım', en: 'Software' },
  'kind.tool': { tr: 'Araç', en: 'Tool' },
  'kind.localization': { tr: 'Lokalizasyon', en: 'Localization' },
  'kind.web': { tr: 'Web sitesi', en: 'Website' },
  'kind.other': { tr: 'Diğer', en: 'Other' },

  '404.title': { tr: 'Bu sayfa yenmiş', en: 'This page got eaten' },
  '404.body': {
    tr: 'Bir Parlavan buradaki Parlamonium’u yemiş gibi görünüyor. Aradığın sayfa yok ya da taşındı.',
    en: 'Looks like a Parlavan ate the Parlamonium that was here. The page is gone or has moved.',
  },

  'footer.contact': { tr: 'İletişim', en: 'Contact' },
  'footer.now': { tr: 'Şu anda:', en: 'Right now:' },
  'footer.clock': { tr: 'Bandırma’da saat', en: 'Time in Bandırma' },
} satisfies Record<string, L>;
export type UiKey = keyof typeof ui;

export function t(lang: Lang, key: UiKey): string {
  return ui[key][lang];
}

export function other(lang: Lang): Lang {
  return lang === 'tr' ? 'en' : 'tr';
}
