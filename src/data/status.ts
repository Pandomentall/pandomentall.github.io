import type { L } from '../i18n/ui';

// work = yellow dot, life = green, sleep = dark. The footer shows how long the current
// kind of activity has been going on: the start of the unbroken run of the same type.
export type StatusType = 'work' | 'life' | 'sleep';

// Footer status under the Bandırma clock: what Ender is (probably) doing at this hour.
// One line per hour, Europe/Istanbul time. Texts are Ender's own (revised 2026-09-28 via
// portfolyo-durumlar.xlsx); lines start lowercase because the footer prefixes "Şu anda:".
export const hourlyStatus: { type: StatusType; text: L }[] = [
  /* 00 */ { type: 'work', text: { tr: 'muhtemelen bu gece sabahlıyoruz', en: 'probably pulling an all-nighter tonight' } },
  /* 01 */ { type: 'work', text: { tr: 'canavarım niye duvarın içinden geçiyor', en: 'why is my monster walking through the wall' } },
  /* 02 */ { type: 'work', text: { tr: 'bug düzeltmeleri...', en: 'bug fixes...' } },
  /* 03 */ { type: 'work', text: { tr: '16. son değişikliği yapıyorum', en: 'making the 16th last change' } },
  /* 04 */ { type: 'work', text: { tr: 'iki günlük emeğimi 15 dakikada yok ettim', en: 'just wiped out two days of work in 15 minutes' } },
  /* 05 */ { type: 'work', text: { tr: 'ezana kadar çalışmaya devam', en: 'working on until the dawn call to prayer' } },
  /* 06 */ { type: 'sleep', text: { tr: 'uykuya dalmak üzereyim', en: 'about to fall asleep' } },
  /* 07 */ { type: 'sleep', text: { tr: 'uyuyorum', en: 'asleep' } },
  /* 08 */ { type: 'sleep', text: { tr: 'lucid rüyadayım', en: 'in a lucid dream' } },
  /* 09 */ { type: 'sleep', text: { tr: 'muhtemelen uyuyorum', en: 'probably asleep' } },
  /* 10 */ { type: 'sleep', text: { tr: 'muhtemelen uyuyorum', en: 'probably asleep' } },
  /* 11 */ { type: 'sleep', text: { tr: 'muhtemelen uyuyorum', en: 'probably asleep' } },
  /* 12 */ { type: 'life', text: { tr: 'sabah tostumu yiyorum. Evet, öğlen on ikide.', en: 'having my morning toast. Yes, at noon.' } },
  /* 13 */ { type: 'life', text: { tr: '4. çayı içiyorum', en: 'on my fourth tea' } },
  /* 14 */ { type: 'life', text: { tr: 'oyun oynuyorum', en: 'playing games' } },
  /* 15 */ { type: 'life', text: { tr: 'Poyraz Karayel izliyorum', en: 'watching Poyraz Karayel' } },
  /* 16 */ { type: 'work', text: { tr: 'yeni projeler planlıyorum', en: 'planning new projects' } },
  /* 17 */ { type: 'life', text: { tr: 'daha iyi bir hayat için muhtemelen plan yapıyorum', en: 'probably planning a better life' } },
  /* 18 */ { type: 'life', text: { tr: 'PC molada', en: 'the PC is on a break' } },
  /* 19 */ { type: 'life', text: { tr: 'izleyecek film arıyorum', en: 'looking for a film to watch' } },
  /* 20 */ { type: 'life', text: { tr: 'Steam kütüphaneme boş boş bakıyorum', en: 'staring blankly at my Steam library' } },
  /* 21 */ { type: 'work', text: { tr: 'Claude ile yeni bir özelliği tartışıyoruz. Ben kazanıyorum.', en: 'debating a new feature with Claude. I am winning.' } },
  /* 22 */ { type: 'work', text: { tr: 've şimdi nöbetim başlar', en: 'and my watch begins' } },
  /* 23 */ { type: 'work', text: { tr: 'Break Core eşliğinde pişiriyorum', en: 'cooking along to breakcore' } },
];
