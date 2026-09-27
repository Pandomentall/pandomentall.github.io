// Site-wide identity and links.
// A social entry with url: null is not rendered — fill it in when the handle is known.

export const site = {
  name: 'Ender Aygün',
  url: 'https://pandomentall.github.io',
  // Google Search Console "HTML tag" verification token (content="..."), empty = no tag.
  googleVerification: '',
};

// Email is stored in parts and assembled client-side, so the full address
// never appears as plain text in the HTML (basic scraper protection).
export const emailParts = { user: 'enderaygun1', domain: 'gmail', tld: 'com' };

export type SocialId = 'github' | 'linkedin' | 'itch' | 'steam' | 'instagram';

export const socials: { id: SocialId; label: string; handle: string; url: string | null }[] = [
  { id: 'github', label: 'GitHub', handle: 'Pandomentall', url: 'https://github.com/Pandomentall' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: 'Ender Aygün',
    url: 'https://www.linkedin.com/in/ender-ayg%C3%BCn-009274205/',
  },
  { id: 'itch', label: 'itch.io', handle: 'Pandomental', url: 'https://rare-d.itch.io/' },
  { id: 'steam', label: 'Steam', handle: 'Dümbük', url: 'https://steamcommunity.com/profiles/76561198440311576/' },
  { id: 'instagram', label: 'Instagram', handle: '@ender.aygun', url: 'https://www.instagram.com/ender.aygun/' },
];

export const activeSocials = socials.filter((s): s is typeof s & { url: string } => s.url !== null);
