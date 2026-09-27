import type { L } from '../i18n/ui';

// work = yellow dot, life = green, sleep = dark. The footer shows how long the current
// kind of activity has been going on: the start of the unbroken run of the same type.
export type StatusType = 'work' | 'life' | 'sleep';

// Footer status under the Bandırma clock: what Ender is (probably) doing at this hour.
// One line per hour, Europe/Istanbul time. Anchors from Ender: 00–06 working,
// 06–12 asleep, 12–15 morning toast. The rest follows his habits (night owl, Unity,
// Ellam, Bannerlord, basketball, Duolingo Spanish, anime, orchestral metal).
export const hourlyStatus: { type: StatusType; text: L }[] = [
  /* 00 */ { type: 'work', text: { tr: 'Muhtemelen çalışıyorum. Gece en verimli mesaim.', en: 'Probably working. Night is my most productive shift.' } },
  /* 01 */ { type: 'work', text: { tr: 'Bir Parlavan neden duvara yürüyor, onu çözüyorum.', en: 'Figuring out why a Parlavan keeps walking into a wall.' } },
  /* 02 */ { type: 'work', text: { tr: 'Unity derliyor. Ben bekliyorum. Unity derliyor.', en: 'Unity is compiling. I am waiting. Unity is compiling.' } },
  /* 03 */ { type: 'work', text: { tr: '"Son bir değişiklik" diyorum. Üçüncü kez.', en: 'Saying "one last change". For the third time.' } },
  /* 04 */ { type: 'work', text: { tr: 'Commit mesajı ile "bir savaş daha" arasında kaldım.', en: 'Torn between a commit message and "one more battle".' } },
  /* 05 */ { type: 'work', text: { tr: 'Kuşlar ötmeye başladı. Bu bir işaret: yatıyorum.', en: 'The birds have started. That is my cue: off to bed.' } },
  /* 06 */ { type: 'sleep', text: { tr: 'Uyuyorum.', en: 'Asleep.' } },
  /* 07 */ { type: 'sleep', text: { tr: 'Hâlâ uyuyorum. Rüyamda bug fix’liyorum.', en: 'Still asleep. Fixing bugs in my dreams.' } },
  /* 08 */ { type: 'sleep', text: { tr: 'Uyuyorum. E-postan kuyrukta, sırasını bekliyor.', en: 'Asleep. Your email is safely in the queue.' } },
  /* 09 */ { type: 'sleep', text: { tr: 'Derin uyku. Alarm diye bir kavram tanımıyoruz.', en: 'Deep sleep. We do not recognise the concept of alarms.' } },
  /* 10 */ { type: 'sleep', text: { tr: 'Uyku modu. Bandırma sessiz, ben daha sessiz.', en: 'Sleep mode. Bandırma is quiet, I am quieter.' } },
  /* 11 */ { type: 'sleep', text: { tr: 'Gözler açıldı, beyin hâlâ yükleniyor: %37.', en: 'Eyes open, brain still loading: 37%.' } },
  /* 12 */ { type: 'life', text: { tr: 'Sabah tostumu yiyorum. Evet, öğlen on ikide.', en: 'Having my morning toast. Yes, at noon.' } },
  /* 13 */ { type: 'life', text: { tr: 'Tost bitti, çay ikinci demde.', en: 'Toast done, tea on its second brew.' } },
  /* 14 */ { type: 'life', text: { tr: 'Mailleri okuyorum. Seninki de arada bir yerde.', en: 'Reading email. Yours is in there somewhere.' } },
  /* 15 */ { type: 'life', text: { tr: 'Duolingo baykuşu tehdit etmeden İspanyolcamı yapıyorum.', en: 'Doing my Spanish before the Duolingo owl turns hostile.' } },
  /* 16 */ { type: 'work', text: { tr: 'Kâğıda mimari çiziyorum. Kod yok, ok çok.', en: 'Drawing architecture on paper. No code, lots of arrows.' } },
  /* 17 */ { type: 'life', text: { tr: 'Sahada basketbol. Ya da en azından planı.', en: 'On the court playing basketball. Or at least planning to.' } },
  /* 18 */ { type: 'life', text: { tr: 'Akşam yemeği. Bilgisayar da dinleniyor (dinlenmiyor).', en: 'Dinner. The computer is resting too (it is not).' } },
  /* 19 */ { type: 'life', text: { tr: 'Bir bölüm Mushoku Tensei, sonra işe dönüyorum. Söz.', en: 'One episode of Mushoku Tensei, then back to work. Promise.' } },
  /* 20 */ { type: 'life', text: { tr: 'Bannerlord’da "bir savaş daha" diyorum.', en: 'Saying "one more battle" in Bannerlord.' } },
  /* 21 */ { type: 'work', text: { tr: 'Claude ile yeni bir özelliği tartışıyoruz. Ben kazanıyorum.', en: 'Debating a new feature with Claude. I am winning.' } },
  /* 22 */ { type: 'work', text: { tr: 'Gece vardiyası ısınıyor. Kahve dolu.', en: 'Night shift warming up. Coffee is full.' } },
  /* 23 */ { type: 'work', text: { tr: 'Tam odak. Kulaklıkta orkestral metal.', en: 'Full focus. Orchestral metal in the headphones.' } },
];
