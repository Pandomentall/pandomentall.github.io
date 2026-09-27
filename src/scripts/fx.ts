// Hover particle effects for project/game row cards. Each card has a <canvas class="fx">
// between its media and its text; the effect runs while the card is hovered or focused,
// then lets its particles die out and stops. Nothing runs for reduced motion.
//
//   flame        Let Him Cook   gas-stove flame from the bottom edge + rising embers
//   siren        Firar          red/blue police lightbar sweeping the card
//   stars        Uzay Çöpü      twinkling field + shooting stars
//   matrix       Turkish patches  falling words that turn Turkish on the way down
//   typing       RaporGo        report JSON typed over the screenshot
//   parlamonium  Ellam: Rogue   gold/purple streaks with sparks on impact
//   rating       Kumpircim      waffle grid presses in, five stars light up, sparkles rise
export type FxKind = 'flame' | 'siren' | 'stars' | 'matrix' | 'typing' | 'parlamonium' | 'rating';

type Rect = { x: number; y: number; w: number; h: number };
interface Effect {
  update(dt: number, on: boolean, t: number): void;
  draw(ctx: CanvasRenderingContext2D, t: number): void;
  idle(): boolean;
}
type Make = (w: number, h: number, media: Rect, accent: [string, string]) => Effect;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

// Shared intensity ramp: fades in while hovered, out afterwards.
const ramp = (v: number, on: boolean, dt: number, speed = 3) => Math.max(0, Math.min(1, v + (on ? dt : -dt) * speed));

const flame: Make = (w, h) => {
  // A gas-stove burner along the bottom edge: a row of flickering blue flame tongues with
  // light cores and orange tips, warm air above, embers drifting up.
  type E = { x: number; y: number; vx: number; vy: number; life: number; age: number; size: number };
  const embers: E[] = [];
  const GAP = 13;
  const tongues = Array.from({ length: Math.ceil(w / GAP) + 1 }, (_, i) => ({ x: i * GAP, seed: Math.random() * 100 }));
  let heat = 0;
  const tongue = (ctx: CanvasRenderingContext2D, x: number, half: number, height: number, base: string, top: string) => {
    const g = ctx.createLinearGradient(0, h, 0, h - height);
    g.addColorStop(0, base);
    g.addColorStop(1, top);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - half, h + 2);
    ctx.quadraticCurveTo(x - half, h - height * 0.55, x, h - height);
    ctx.quadraticCurveTo(x + half, h - height * 0.55, x + half, h + 2);
    ctx.closePath();
    ctx.fill();
  };
  return {
    update(dt, on) {
      heat = ramp(heat, on, dt, 2.2);
      if (on && Math.random() < dt * 18)
        embers.push({ x: rand(0, w), y: h - rand(10, 24), vx: rand(-12, 12), vy: rand(-120, -55), life: rand(1, 2.2), age: 0, size: rand(1.2, 2.4) });
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.age += dt;
        if (e.age > e.life) {
          embers.splice(i, 1);
          continue;
        }
        e.x += (e.vx + Math.sin(e.age * 5 + e.size * 7) * 22) * dt;
        e.y += e.vy * dt;
      }
    },
    draw(ctx, t) {
      if (heat > 0) {
        // warm air rising off the burner
        const g = ctx.createLinearGradient(0, h, 0, h * 0.2);
        g.addColorStop(0, `rgba(255,150,60,${0.22 * heat})`);
        g.addColorStop(1, 'rgba(255,150,60,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        for (const f of tongues) {
          const flick = Math.sin(t * 11 + f.seed) * 0.5 + Math.sin(t * 17 + f.seed * 1.7) * 0.5;
          const height = (20 + flick * 7) * heat;
          if (height < 1) continue;
          // outer blue, then light core, then a hint of orange on the tip
          tongue(ctx, f.x, 6.5, height, `rgba(60,120,255,${0.75 * heat})`, 'rgba(60,120,255,0)');
          tongue(ctx, f.x, 3.2, height * 0.62, `rgba(170,215,255,${0.85 * heat})`, 'rgba(170,215,255,0)');
          if (flick > 0.35) tongue(ctx, f.x + flick * 2, 2.4, height * 1.25, 'rgba(255,150,50,0)', `rgba(255,150,50,${0.35 * heat})`);
        }
      } else ctx.globalCompositeOperation = 'lighter';
      for (const e of embers) {
        const k = e.age / e.life;
        ctx.fillStyle = `rgba(255,${180 - k * 90},70,${1 - k})`;
        ctx.fillRect(e.x, e.y, e.size, e.size);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    idle: () => heat === 0 && embers.length === 0,
  };
};

const siren: Make = (w, h) => {
  let v = 0;
  const beam = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, color: string, a: number) => {
    const R = Math.hypot(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.8);
    g.addColorStop(0, `rgba(${color},${0.38 * a})`);
    g.addColorStop(1, `rgba(${color},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, R, dir - 0.26, dir + 0.26);
    ctx.closePath();
    ctx.fill();
  };
  return {
    update(dt, on) {
      v = ramp(v, on, dt, 4);
    },
    draw(ctx, t) {
      if (v === 0) return;
      const phase = Math.floor(t * 4) % 2; // 2 Hz alternation
      ctx.globalCompositeOperation = 'lighter';
      // full-card wash, alternating
      ctx.fillStyle = phase ? `rgba(255,40,50,${0.1 * v})` : `rgba(40,110,255,${0.1 * v})`;
      ctx.fillRect(0, 0, w, h);
      // rotating beams from the lightbar at the top centre
      const cx = w * 0.5;
      beam(ctx, cx - 14, 0, Math.PI * 0.5 + Math.sin(t * 5) * 1.1, '255,50,60', v);
      beam(ctx, cx + 14, 0, Math.PI * 0.5 - Math.sin(t * 5) * 1.1, '60,130,255', v);
      // the lightbar itself
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `rgba(255,60,70,${(phase ? 1 : 0.35) * v})`;
      ctx.fillRect(cx - 34, 0, 30, 5);
      ctx.fillStyle = `rgba(70,140,255,${(phase ? 0.35 : 1) * v})`;
      ctx.fillRect(cx + 4, 0, 30, 5);
    },
    idle: () => v === 0,
  };
};

const stars: Make = (w, h, _m, accent) => {
  const field = Array.from({ length: Math.round((w * h) / 2600) }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(0.4, 1.3), p: rand(0, 6) }));
  type S = { x: number; y: number; vx: number; vy: number; len: number };
  const shots: S[] = [];
  let v = 0;
  let next = 0;
  return {
    update(dt, on, t) {
      v = ramp(v, on, dt, 3);
      if (on && t > next) {
        next = t + rand(0.18, 0.5);
        const speed = rand(520, 820);
        const ang = rand(0.45, 0.75); // down-left
        shots.push({ x: rand(w * 0.3, w + 80), y: rand(-40, h * 0.4), vx: -Math.cos(ang) * speed, vy: Math.sin(ang) * speed, len: rand(70, 160) });
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x < -200 || s.y > h + 200) shots.splice(i, 1);
      }
    },
    draw(ctx, t) {
      if (v > 0)
        for (const s of field) {
          ctx.fillStyle = `rgba(232,228,220,${v * (0.35 + 0.35 * Math.sin(t * 3 + s.p))})`;
          ctx.fillRect(s.x, s.y, s.r * 2, s.r * 2);
        }
      ctx.lineCap = 'round';
      for (const s of shots) {
        const n = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / n) * s.len;
        const ty = s.y - (s.vy / n) * s.len;
        const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, accent[0]);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillRect(s.x - 1.2, s.y - 1.2, 2.4, 2.4);
      }
    },
    idle: () => v === 0 && shots.length === 0,
  };
};

const WORDS: [string, string][] = [
  ['START', 'BAŞLA'], ['OPTIONS', 'AYARLAR'], ['SAVE', 'KAYDET'], ['LOAD', 'YÜKLE'], ['QUIT', 'ÇIKIŞ'],
  ['YES', 'EVET'], ['NO', 'HAYIR'], ['BACK', 'GERİ'], ['GOLD', 'ALTIN'], ['SWORD', 'KILIÇ'],
  ['NEWS', 'HABER'], ['LIVE', 'CANLI'], ['CENSOR', 'SANSÜR'], ['ARMOR', 'ZIRH'], ['CONTINUE', 'DEVAM'],
];
const GLYPHS = 'ÇĞİÖŞÜçğıöşü#%&*+=';

const matrix: Make = (w, h, _m, accent) => {
  const COL = 20;
  const LINE = 15;
  type D = { x: number; y: number; v: number; en: string; tr: string; flip: number; flipAt: number };
  const drops: D[] = [];
  let v = 0;
  const spawn = (x: number): D => {
    const [en, tr] = pick(WORDS);
    return { x, y: rand(-120, -20), v: rand(70, 150), en, tr, flip: 0, flipAt: rand(h * 0.25, h * 0.6) };
  };
  return {
    update(dt, on) {
      v = ramp(v, on, dt, 3);
      if (on && drops.length < Math.floor(w / COL) * 0.55 && Math.random() < dt * 22) {
        drops.push(spawn(Math.floor(rand(0, w / COL)) * COL + 6));
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.v * dt;
        if (d.y > d.flipAt) d.flip = Math.min(1, d.flip + dt * 3.5);
        if (d.y - 10 * LINE > h) drops.splice(i, 1);
      }
    },
    draw(ctx) {
      ctx.font = '600 12px "Geist Mono Variable", monospace';
      ctx.textAlign = 'center';
      for (const d of drops) {
        const scrambling = d.flip > 0 && d.flip < 1;
        const word = d.flip >= 1 ? d.tr : d.en;
        for (let i = 0; i < word.length; i++) {
          const y = d.y - i * LINE; // head at the bottom, word reads upward like rain
          if (y < -LINE || y > h + LINE) continue;
          const ch = scrambling && Math.random() < 0.6 ? pick([...GLYPHS]) : word[word.length - 1 - i];
          const a = (1 - i / (word.length + 2)) * 0.6;
          ctx.fillStyle = d.flip >= 1 ? hexA(accent[0], a) : scrambling ? `rgba(255,255,255,${a})` : `rgba(110,227,154,${a * 0.9})`;
          ctx.fillText(ch, d.x, y);
        }
      }
      ctx.textAlign = 'start';
    },
    idle: () => v === 0 && drops.length === 0,
  };
};

const REPORT = [
  '{',
  '  "template": "mavi-resmi",',
  '  "title": "Q3 Operasyon Raporu",',
  '  "segments": [',
  '    { "type": "chart", "kind": "line" },',
  '    { "type": "callout", "tone": "info" },',
  '    { "type": "table", "rows": 12 }',
  '  ]',
  '}',
];

const typing: Make = (_w, _h, m, accent) => {
  let v = 0;
  let chars = 0;
  const total = REPORT.join('\n').length;
  return {
    update(dt, on) {
      v = ramp(v, on, dt, 3);
      if (on) chars = Math.min(total + 30, chars + dt * 55);
      else if (v === 0) chars = 0;
    },
    draw(ctx, t) {
      if (v === 0) return;
      ctx.fillStyle = `rgba(20,26,34,${0.78 * v})`;
      ctx.fillRect(m.x, m.y, m.w, m.h);
      const size = Math.max(10, Math.min(13, m.w / 26));
      ctx.font = `500 ${size}px "Geist Mono Variable", monospace`;
      let left = Math.floor(chars);
      let y = m.y + 18;
      let caret = { x: m.x + 14, y };
      for (const line of REPORT) {
        if (left <= 0) break;
        const shown = line.slice(0, left);
        left -= line.length + 1;
        // keys in accent, the rest light
        ctx.fillStyle = `rgba(232,228,220,${v})`;
        ctx.fillText(shown, m.x + 14, y);
        const key = shown.match(/"[a-z]+"(?=:)/g);
        if (key) {
          ctx.fillStyle = hexA(accent[0], v);
          let from = 0;
          for (const k of key) {
            const i = shown.indexOf(k, from);
            ctx.fillText(k, m.x + 14 + ctx.measureText(shown.slice(0, i)).width, y);
            from = i + k.length;
          }
        }
        caret = { x: m.x + 14 + ctx.measureText(shown).width + 2, y };
        y += size + 6;
      }
      if (Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = hexA(accent[1], v);
        ctx.fillRect(caret.x, caret.y - size + 2, 2, size);
      }
    },
    idle: () => v === 0,
  };
};

const parlamonium: Make = (w, h, _m, accent) => {
  type Dr = { x: number; y: number; v: number; len: number; purple: boolean };
  type Sp = { x: number; y: number; vx: number; vy: number; age: number };
  const drops: Dr[] = [];
  const sparks: Sp[] = [];
  const SL = 0.32;
  let v = 0;
  return {
    update(dt, on) {
      v = ramp(v, on, dt, 3);
      if (on && Math.random() < dt * 40)
        drops.push({ x: rand(0, w + h * SL), y: rand(-60, -10), v: rand(260, 460), len: rand(14, 36), purple: Math.random() < 0.2 });
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.v * dt;
        d.x -= d.v * dt * SL;
        if (d.y >= h) {
          for (let k = 0; k < 3; k++) sparks.push({ x: d.x, y: h - 1, vx: rand(-60, 60), vy: rand(-90, -30), age: 0 });
          drops.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        s.vy += 220 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.age > 0.5) sparks.splice(i, 1);
      }
    },
    draw(ctx) {
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';
      for (const d of drops) {
        const g = ctx.createLinearGradient(d.x + d.len * SL, d.y - d.len, d.x, d.y);
        const c = d.purple ? accent[1] : accent[0];
        g.addColorStop(0, hexA(c, 0));
        g.addColorStop(1, hexA(c, 0.9));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(d.x + d.len * SL, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      for (const s of sparks) {
        ctx.fillStyle = hexA(accent[0], 1 - s.age / 0.5);
        ctx.fillRect(s.x, s.y, 2, 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    idle: () => v === 0 && drops.length === 0 && sparks.length === 0,
  };
};

const rating: Make = (w, h, m, accent) => {
  // The router's whole job is "rate us": a waffle grid presses into the card,
  // five stars light up one by one over the screenshot, then sparkles drift up.
  type Sp = { x: number; y: number; vy: number; age: number; life: number };
  const sparks: Sp[] = [];
  let v = 0;
  let lit = 0; // 0..5, fractional while a star pops
  const star = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  const R = Math.min(m.w / 13, 16);
  const centres = Array.from({ length: 5 }, (_, i) => ({ x: m.x + m.w / 2 + (i - 2) * R * 2.5, y: m.y + m.h * 0.72 }));
  return {
    update(dt, on) {
      v = ramp(v, on, dt, 3);
      lit = on ? Math.min(5, lit + dt * 6) : Math.max(0, lit - dt * 10);
      if (on && lit >= 5 && Math.random() < dt * 20) {
        const c = pick(centres);
        sparks.push({ x: c.x + rand(-R, R), y: c.y - R * 0.5, vy: rand(-70, -35), age: 0, life: rand(0.6, 1.2) });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        s.y += s.vy * dt;
        if (s.age > s.life) sparks.splice(i, 1);
      }
    },
    draw(ctx) {
      if (v > 0) {
        // waffle grid
        ctx.strokeStyle = hexA(accent[1], 0.22 * v);
        ctx.lineWidth = 3;
        const step = 26;
        ctx.beginPath();
        for (let x = step / 2; x < w; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let y = step / 2; y < h; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
        // dim the screenshot a little so the stars read
        ctx.fillStyle = `rgba(15,22,40,${0.45 * v})`;
        ctx.fillRect(m.x, m.y, m.w, m.h);
        centres.forEach((c, i) => {
          const k = Math.max(0, Math.min(1, lit - i));
          const pop = k > 0 && k < 1 ? 1 + Math.sin(k * Math.PI) * 0.35 : 1;
          star(ctx, c.x, c.y, R * pop);
          ctx.fillStyle = k > 0 ? hexA(accent[0], v) : `rgba(232,228,220,${0.18 * v})`;
          ctx.fill();
        });
      }
      for (const s of sparks) {
        ctx.fillStyle = hexA(accent[0], 1 - s.age / s.life);
        ctx.fillRect(s.x, s.y, 2, 2);
      }
    },
    idle: () => v === 0 && sparks.length === 0,
  };
};

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a.toFixed(3)})`;
}

const EFFECTS: Record<FxKind, Make> = { flame, siren, stars, matrix, typing, parlamonium, rating };

export function attachFx(card: HTMLElement): void {
  const kind = card.dataset.fx as FxKind | undefined;
  const canvas = card.querySelector<HTMLCanvasElement>('canvas.fx');
  if (!kind || !canvas || !EFFECTS[kind]) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const accent: [string, string] = [card.dataset.a1 ?? '#8cc8ec', card.dataset.a2 ?? '#a8cfae'];
  const mediaEl = card.querySelector<HTMLElement>('[data-fx-media]');

  let on = false;
  let running = false;
  let effect: Effect | null = null;
  let ctx: CanvasRenderingContext2D;
  let w = 0;
  let h = 0;

  const setup = () => {
    const r = card.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const m = mediaEl?.getBoundingClientRect();
    const media = m ? { x: m.left - r.left, y: m.top - r.top, w: m.width, h: m.height } : { x: 0, y: 0, w, h };
    effect = EFFECTS[kind](w, h, media, accent);
  };

  const loop = () => {
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      effect!.update(dt, on, (now - t0) / 1000);
      ctx.clearRect(0, 0, w, h);
      effect!.draw(ctx, (now - t0) / 1000);
      if (!on && effect!.idle()) {
        running = false;
        ctx.clearRect(0, 0, w, h);
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const start = () => {
    on = true;
    if (running) return;
    running = true;
    setup();
    loop();
  };
  const stop = () => (on = false);

  card.addEventListener('pointerenter', start);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focusin', start);
  card.addEventListener('focusout', stop);
}
