import type { L } from '../i18n/ui';

// Single source for the CV: /cv, /en/cv and both generated PDFs render from this file.
// Original: Ender-Aygun-CV.pdf (2026). Privacy rules for the public site:
//   - no phone number (Ender's or anyone else's)
//   - references show name + title only, contact "on request"
//   - no birth date (kept out of the public repo entirely)

export const person = {
  name: 'Ender Aygün',
  title: { tr: 'Bilişim & Teknoloji Geliştirici', en: 'Software & Technology Developer' } satisfies L,
  location: { tr: 'Balıkesir / Bandırma', en: 'Bandırma, Balıkesir, Türkiye' } satisfies L,
};

export type SectionId = 'profile' | 'experience' | 'projects' | 'education' | 'references';

// Order here is the order on the page (same as the original PDF).
export const sectionTitles: Record<SectionId, L> = {
  profile: { tr: 'Profil', en: 'Profile' },
  experience: { tr: 'İş Deneyimi', en: 'Experience' },
  projects: { tr: 'Kişisel Projeler & İlgi Alanları', en: 'Personal Projects & Interests' },
  education: { tr: 'Eğitim', en: 'Education' },
  references: { tr: 'Referanslar', en: 'References' },
};

export const profile: L = {
  tr: 'Bilgisayar ve teknoloji alanında geniş bir yelpazede çalışan, meraklı ve çok yönlü bir geliştirici profiliyim. Yazılım geliştirme, oyun yapımı, donanım ile yazılımın kesiştiği gömülü sistemler, oyun lokalizasyonu ve hayatı kolaylaştıran araç geliştirme gibi farklı alanlarda bağımsız olarak üretim yapabiliyorum. Bilgisayarın dahil olduğu her alan benim için bir öğrenme ve üretme zeminine dönüşüyor. Profesyonel tarafta; Bubble.io üzerinde kurumsal düzeyde ERP, CRM ve operasyonel yönetim modülleri geliştirdim; REST API entegrasyonları, mobil uygulama bağlantıları, özel JavaScript eklentileri ve webhook yönetimi konularında kapsamlı deneyim kazandım. Teknik kararları iş hedefleriyle hizalamayı ve sistemleri uzun vadeli düşünerek tasarlamayı önceliklendiriyorum.',
  en: 'I am a curious, versatile developer working across a wide range of computing and technology. I build independently in software development, game development, embedded systems where hardware meets software, game localization, and small tools that make everyday life easier. Any field that involves a computer becomes ground for learning and making something. Professionally, I built enterprise-grade ERP, CRM and operations management modules on Bubble.io, and gained extensive experience with REST API integrations, mobile app connections, custom JavaScript plugins and webhook management. I prioritize aligning technical decisions with business goals and designing systems with the long term in mind.',
};

export interface Job {
  period: string;
  company: string;
  role: L;
  bullets: L[];
  modules?: L[];
}

export const experience: Job[] = [
  {
    period: '2024 – 2026',
    company: 'Flowick Teknoloji Hizmetleri A.Ş.',
    role: { tr: 'Yazılım Geliştirici', en: 'Software Developer' },
    bullets: [
      {
        tr: 'Mevcut no-code altyapıyı JavaScript, REST API ve özel entegrasyonlarla genişleterek modüler ve sürdürülebilir bir yapıya dönüştürdüm.',
        en: 'Extended the existing no-code platform with JavaScript, REST APIs and custom integrations, turning it into a modular, maintainable structure.',
      },
      {
        tr: 'Şirketin tüm mobil uygulama bağlantılarını ve dış servis API entegrasyonlarını uçtan uca tasarlayıp hayata geçirdim.',
        en: "Designed and delivered, end to end, all of the company's mobile app connections and third-party API integrations.",
      },
      {
        tr: 'Birden fazla departmanın iş süreçlerini tek bir sistem üzerinde tutarlı şekilde işleyebilen backend mimarisinin kurulmasında etkin rol üstlendim.',
        en: 'Played an active role in building a backend architecture that runs the workflows of multiple departments consistently on a single system.',
      },
      {
        tr: 'Yeni modüllerin kırılmadan ve hızla eklenebileceği, genişlemeye uygun bir yazılım altyapısı oluşturulmasına katkı sağladım.',
        en: 'Contributed to an extensible software foundation where new modules can be added quickly without breaking existing ones.',
      },
    ],
    modules: [
      {
        tr: 'Yardım & Destek (Müşteri → Şirket) | Hatırlatma ve Bildirim Yönetimi',
        en: 'Help & Support (customer → company) | Reminder and Notification Management',
      },
      { tr: 'OKR (Hedef ve Anahtar Sonuç Takibi)', en: 'OKR (Objectives and Key Results tracking)' },
      { tr: 'Üretim Yönetimi ve tüm MRP modülleri', en: 'Production Management and all MRP modules' },
      { tr: 'Eğitim Yönetimi | Lojistik Yönetimi', en: 'Training Management | Logistics Management' },
    ],
  },
  {
    period: '2023 – 2024',
    company: 'English Of London',
    role: { tr: 'Eğitim Danışmanı', en: 'Education Consultant' },
    bullets: [
      {
        tr: 'Yabancı dil kursunun idari ve dijital süreçlerini (öğrenci kayıt yönetimi, telefon karşılama, yönlendirme) sorunsuz biçimde yürüttüm.',
        en: "Ran the language school's administrative and digital processes (student enrollment, front-desk calls, guidance) smoothly.",
      },
      {
        tr: 'İhtiyaç duyulduğunda A1–A2 seviyelerinde yedek öğretmen olarak ders verdim.',
        en: 'Taught A1–A2 level classes as a substitute teacher when needed.',
      },
      {
        tr: 'Kurumun Instagram içerik planlamasını, gönderi tasarımını ve paylaşım süreçlerini yöneterek dijital görünürlüğünü artırdım.',
        en: "Managed the school's Instagram content planning, post design and publishing, increasing its digital visibility.",
      },
    ],
  },
  {
    period: '2022 – 2023',
    company: 'Leon Bilişim',
    role: { tr: 'Teknik Servis Asistanı', en: 'Technical Service Assistant' },
    bullets: [
      {
        tr: 'Bilgisayar formatlama, kamera sistemi kurulumu ve temel elektrik işleri gibi saha teknik operasyonlarında destek verdim.',
        en: 'Supported on-site technical operations such as OS reinstalls, camera system installation and basic electrical work.',
      },
      {
        tr: 'Donanım ve saha tarafında pratik deneyim kazanarak teknik problem çözme süreçlerini yakından gözlemledim.',
        en: 'Gained hands-on hardware and field experience and observed technical troubleshooting up close.',
      },
    ],
  },
];

export const projectsIntro: L = {
  tr: 'Profesyonel deneyimimin dışında, kendi ilgi alanlarımda da aktif olarak üretim yapıyorum:',
  en: 'Outside my professional work, I actively build things in my own areas of interest:',
};

export const interests: { title: L; body: L }[] = [
  {
    title: { tr: 'Oyun Geliştirme', en: 'Game Development' },
    body: {
      tr: 'Unity (C#) ile 2D/3D oyun projeleri geliştiriyorum; mekanik tasarımından sahne kurulumuna kadar süreci bağımsız yürütebiliyorum.',
      en: 'I develop 2D/3D games with Unity (C#) and can run the whole process independently, from mechanic design to scene setup.',
    },
  },
  {
    title: { tr: 'Oyun Lokalizasyonu', en: 'Game Localization' },
    body: {
      tr: 'Yabancı dil oyunlara Türkçe yama yapıyorum; metin çıkarma, çeviri, font uyarlama ve tekrar enjeksiyon süreçlerini başından sonuna götürüyorum.',
      en: 'I make Turkish translation patches for foreign-language games, handling text extraction, translation, font adaptation and re-injection end to end.',
    },
  },
  {
    title: { tr: 'Arduino & Gömülü Sistemler', en: 'Arduino & Embedded Systems' },
    body: {
      tr: 'Arduino tabanlı projelerde sensör entegrasyonu, devre tasarımı ve C/C++ ile firmware geliştirme yapıyorum.',
      en: 'In Arduino-based projects I work on sensor integration, circuit design and firmware development in C/C++.',
    },
  },
  {
    title: { tr: 'Araç & Otomasyon Geliştirme', en: 'Tools & Automation' },
    body: {
      tr: 'Günlük hayatı kolaylaştıran küçük ölçekli yazılım araçları ve otomasyon betikleri geliştiriyorum; yeni teknolojileri ve yapay zeka araçlarını bu süreçlere entegre etmeyi seviyorum.',
      en: 'I build small software tools and automation scripts that make daily life easier, and enjoy bringing new technologies and AI tools into them.',
    },
  },
];

export const education: { period: string; degree: L; school: L }[] = [
  {
    period: '2022 – 2024',
    degree: { tr: 'Önlisans — Bilgisayar Programcılığı', en: "Associate Degree — Computer Programming" },
    school: { tr: 'Beykoz Üniversitesi', en: 'Beykoz University' },
  },
  {
    period: '2018 – 2021',
    degree: { tr: 'Veri Tabanı Programcılığı', en: 'Database Programming' },
    school: {
      tr: '75. Yıl DMO Mesleki ve Teknik Anadolu Lisesi',
      en: '75. Yıl DMO Vocational and Technical Anatolian High School',
    },
  },
];

// Contact details of references are never published (third-party personal data).
export const references: { name: string; affiliation: L }[] = [
  {
    name: 'Barbaros Özdemir',
    affiliation: { tr: 'MetaGuard, CEO', en: 'CEO, MetaGuard' },
  },
];
