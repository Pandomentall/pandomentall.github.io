// Hover effects for project/game row cards. The canvas sits in a halo around the card
// (see WorkRow: .row-wrap > canvas.row__fx + a.row) and the card's own rectangle is clipped
// out, so an effect never covers the image or the text: it happens around the card, mostly
// along its top edge. Motion is slow and low-alpha on purpose: a small taste, not a show.
// Runs only for fine pointers with hover, never for reduced motion; stops when idle.
//
//   flame        Let Him Cook     a row of small gas-stove flames on the top edge, embers
//   siren        Firar            red/blue light spilling around the card, slow alternation
//   stars        Uzay Çöpü        stars twinkling around the card, an occasional shooting star
//   matrix       Turkish patches  words above the card scramble from English into Turkish
//   typing       RaporGo          one report JSON line at a time, typed above the card
//   parlamonium  Ellam: Rogue     gold streaks land on the top edge and spark, drips fall off
//   rating       Kumpircim        five stars above the card light up one by one
export type FxKind = 'flame' | 'siren' | 'stars' | 'matrix' | 'typing' | 'parlamonium' | 'rating';

// Halo size around the card; must match the canvas inset in WorkRow.astro.
export const FX_PAD = { x: 18, y: 34 } as const;

type Rect = { x: number; y: number; w: number; h: number };
interface Effect {
  update(dt: number, on: boolean, t: number): void;
  draw(ctx: CanvasRenderingContext2D, t: number): void;
  idle(): boolean;
}
// W/H: whole canvas; card: the card's rectangle inside it.
type Make = (W: number, H: number, card: Rect, accent: [string, string]) => Effect;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Shared intensity: eases in over ~0.6 s while hovered, out over ~0.9 s afterwards.
const ramp = (v: number, on: boolean, dt: number) => clamp01(v + (on ? dt / 0.6 : -dt / 0.9));

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp01(a).toFixed(3)})`;
}

const flame: Make = (_W, _H, c) => {
  // A burner along the middle of the top edge: small blue tongues with light cores,
  // shorter towards the ends; now and then an ember drifts up and fades.
  type E = { x: number; y: number; vx: number; vy: number; life: number; age: number };
  const embers: E[] = [];
  const GAP = 16;
  const span = c.w * 0.8;
  const x0 = c.x + (c.w - span) / 2;
  const tongues = Array.from({ length: Math.floor(span / GAP) + 1 }, (_, i) => {
    const x = x0 + i * GAP;
    const k = (x - x0) / span; // 0..1 along the burner
    return { x, seed: Math.random() * 100, scale: Math.sin(k * Math.PI) * 0.6 + 0.4 };
  });
  const base = c.y;
  let heat = 0;
  const tongue = (ctx: CanvasRenderingContext2D, x: number, half: number, height: number, col: string, a: number) => {
    const g = ctx.createLinearGradient(0, base, 0, base - height);
    g.addColorStop(0, `rgba(${col},${a})`);
    g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - half, base);
    ctx.quadraticCurveTo(x - half, base - height * 0.55, x, base - height);
    ctx.quadraticCurveTo(x + half, base - height * 0.55, x + half, base);
    ctx.closePath();
    ctx.fill();
  };
  return {
    update(dt, on) {
      heat = ramp(heat, on, dt);
      if (on && heat > 0.5 && Math.random() < dt * 5)
        embers.push({ x: rand(x0, x0 + span), y: base - 8, vx: rand(-6, 6), vy: rand(-26, -14), life: rand(1.2, 2), age: 0 });
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.age += dt;
        if (e.age > e.life) embers.splice(i, 1);
        else {
          e.x += (e.vx + Math.sin(e.age * 3 + e.life * 5) * 5) * dt;
          e.y += e.vy * dt;
        }
      }
    },
    draw(ctx, t) {
      ctx.globalCompositeOperation = 'lighter';
      if (heat > 0)
        for (const f of tongues) {
          const flick = Math.sin(t * 3.2 + f.seed) * 0.5 + Math.sin(t * 5.1 + f.seed * 1.7) * 0.5;
          const height = (16 + flick * 4) * f.scale * heat;
          if (height < 1) continue;
          tongue(ctx, f.x, 5, height, '70,130,255', 0.8 * heat);
          tongue(ctx, f.x, 2.4, height * 0.6, '180,220,255', 0.85 * heat);
        }
      for (const e of embers) {
        const k = e.age / e.life;
        ctx.fillStyle = `rgba(255,${170 - k * 70},70,${(1 - k) * 0.8})`;
        ctx.fillRect(e.x, e.y, 2, 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    idle: () => heat === 0 && embers.length === 0,
  };
};

const siren: Make = (_W, _H, c) => {
  // Light from a lightbar that is not in the picture: a red pool on one side, a blue one on
  // the other, swapping strength smoothly (~0.7 Hz), spilling around the corners.
  let v = 0;
  const pool = (ctx: CanvasRenderingContext2D, x: number, y: number, rgb: string, a: number) => {
    const r = Math.max(c.h * 1.3, 180);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},${a})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  return {
    update(dt, on) {
      v = ramp(v, on, dt);
    },
    draw(ctx, t) {
      if (v === 0) return;
      const s = (Math.sin(t * Math.PI * 1.4) + 1) / 2; // 0..1
      ctx.globalCompositeOperation = 'lighter';
      // measured: 0.1-0.4 peaked at alpha 76/255 and vanished on the dark bg
      pool(ctx, c.x, c.y + c.h * 0.2, '255,60,70', (0.25 + 0.65 * s) * v);
      pool(ctx, c.x + c.w, c.y + c.h * 0.2, '70,130,255', (0.25 + 0.65 * (1 - s)) * v);
      ctx.globalCompositeOperation = 'source-over';
    },
    idle: () => v === 0,
  };
};

const stars: Make = (W, H, c, accent) => {
  // Stars only live in the halo; each fades in at its own pace.
  const field: { x: number; y: number; r: number; p: number }[] = [];
  while (field.length < 50) {
    const x = rand(0, W);
    const y = rand(0, H);
    if (x > c.x - 3 && x < c.x + c.w + 3 && y > c.y - 3 && y < c.y + c.h + 3) continue;
    field.push({ x, y, r: rand(0.6, 1.6), p: rand(0, 6) });
  }
  type S = { x: number; y: number; vx: number; vy: number; len: number };
  const shots: S[] = [];
  let v = 0;
  let next = 0.2;
  return {
    update(dt, on, t) {
      v = ramp(v, on, dt);
      if (on && t > next) {
        next = t + rand(1.3, 2.2);
        // across the top halo, right to left, slightly downhill
        shots.push({ x: c.x + c.w + 40, y: rand(4, c.y - 10), vx: -rand(260, 340), vy: rand(4, 12), len: rand(60, 110) });
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x < -s.len) shots.splice(i, 1);
      }
    },
    draw(ctx, t) {
      if (v > 0)
        for (const s of field) {
          ctx.fillStyle = `rgba(232,228,220,${v * (0.5 + 0.35 * Math.sin(t * 1.3 + s.p))})`;
          ctx.fillRect(s.x, s.y, s.r * 2, s.r * 2);
        }
      ctx.lineCap = 'round';
      for (const s of shots) {
        const n = Math.hypot(s.vx, s.vy);
        const tx = s.x - (s.vx / n) * s.len;
        const ty = s.y - (s.vy / n) * s.len;
        const g = ctx.createLinearGradient(tx, ty, s.x, s.y);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, hexA(accent[0], 1));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
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
const GLYPHS = [...'ÇĞİÖŞÜçğıöşü#%&*+='];

const matrix: Make = (_W, _H, c, accent) => {
  // A few words sit above the card in green; each scrambles and settles into Turkish in the
  // accent colour, holds, fades, and a new one takes its slot.
  const SLOTS = Math.max(3, Math.floor(c.w / 180));
  type Wd = { en: string; tr: string; x: number; age: number; flipAt: number; life: number };
  const words: (Wd | null)[] = Array(SLOTS).fill(null);
  const y = c.y - 12;
  let v = 0;
  const spawn = (i: number, delay: number): Wd => {
    const [en, tr] = pick(WORDS);
    const slotW = c.w / SLOTS;
    return { en, tr, x: c.x + slotW * i + rand(10, slotW - 80), age: -delay, flipAt: rand(0.9, 1.5), life: rand(3.2, 4.2) };
  };
  return {
    update(dt, on) {
      v = ramp(v, on, dt);
      for (let i = 0; i < SLOTS; i++) {
        const w = words[i];
        if (!w) {
          if (on) words[i] = spawn(i, rand(0, 1.2));
          continue;
        }
        w.age += dt;
        if (w.age > w.life) words[i] = on ? spawn(i, rand(0.2, 0.8)) : null;
      }
    },
    draw(ctx) {
      ctx.font = '600 12.5px "Geist Mono Variable", monospace';
      for (const w of words) {
        if (!w || w.age < 0) continue;
        const fade = Math.min(w.age / 0.4, (w.life - w.age) / 0.6, 1) * v;
        if (fade <= 0) continue;
        const k = (w.age - w.flipAt) / 0.5; // 0..1 while scrambling
        let text = w.en;
        let color = `rgba(110,227,154,${0.95 * fade})`;
        if (k >= 1) {
          text = w.tr;
          color = hexA(accent[0], 0.95 * fade);
        } else if (k > 0) {
          const n = Math.max(w.en.length, w.tr.length);
          text = Array.from({ length: n }, (_, i) => (Math.random() < 0.5 ? pick(GLYPHS) : (w.tr[i] ?? ''))).join('');
          color = `rgba(232,228,220,${0.8 * fade})`;
        }
        ctx.fillStyle = color;
        ctx.fillText(text, w.x, y);
      }
    },
    idle: () => v === 0 && words.every((w) => !w),
  };
};

const REPORT = [
  '"template": "mavi-resmi"',
  '"title": "Q3 Operasyon Raporu"',
  '{ "type": "chart", "kind": "line" }',
  '{ "type": "callout", "tone": "info" }',
  '{ "type": "table", "rows": 12 }',
];

const typing: Make = (_W, _H, c, accent) => {
  // One line at a time above the card's left edge: typed, held, erased, next.
  let v = 0;
  let line = 0;
  let chars = 0;
  let phase: 'type' | 'hold' | 'erase' = 'type';
  let hold = 0;
  const x = c.x + 4;
  const y = c.y - 12;
  return {
    update(dt, on) {
      v = ramp(v, on, dt);
      if (!on && v === 0) {
        chars = 0;
        phase = 'type';
        return;
      }
      const text = REPORT[line];
      if (phase === 'type') {
        chars = Math.min(text.length, chars + dt * 22);
        if (chars >= text.length) {
          phase = 'hold';
          hold = 1.6;
        }
      } else if (phase === 'hold') {
        hold -= dt;
        if (hold <= 0) phase = 'erase';
      } else {
        chars -= dt * 60;
        if (chars <= 0) {
          chars = 0;
          phase = 'type';
          line = (line + 1) % REPORT.length;
        }
      }
    },
    draw(ctx, t) {
      if (v === 0) return;
      ctx.font = '500 12.5px "Geist Mono Variable", monospace';
      const shown = REPORT[line].slice(0, Math.floor(chars));
      ctx.fillStyle = `rgba(232,228,220,${v})`;
      ctx.fillText(shown, x, y);
      // keys in the accent colour
      ctx.fillStyle = hexA(accent[0], 0.95 * v);
      for (const m of shown.matchAll(/"[a-z]+"(?=:)/g)) ctx.fillText(m[0], x + ctx.measureText(shown.slice(0, m.index)).width, y);
      if (phase !== 'hold' || Math.floor(t * 2) % 2 === 0) {
        ctx.fillStyle = hexA(accent[1], 0.9 * v);
        ctx.fillRect(x + ctx.measureText(shown).width + 2, y - 10, 2, 13);
      }
    },
    idle: () => v === 0,
  };
};

const parlamonium: Make = (W, _H, c, accent) => {
  // Parlamonium rain lands on the card: slanted gold streaks (the odd purple one) end on the
  // top edge with a small spark; once in a while a drip runs off the bottom edge.
  type Dr = { x: number; y: number; v: number; len: number; purple: boolean };
  type Sp = { x: number; y: number; vx: number; vy: number; age: number };
  type Drip = { x: number; y: number; v: number; age: number };
  const drops: Dr[] = [];
  const sparks: Sp[] = [];
  const drips: Drip[] = [];
  const SL = 0.32;
  let v = 0;
  return {
    update(dt, on) {
      v = ramp(v, on, dt);
      // slow and dense enough to read in a 34px strip (first pass at 9/s, 150-210px/s was invisible)
      if (on && Math.random() < dt * 24)
        drops.push({ x: rand(c.x + 20, Math.min(W, c.x + c.w + c.y * SL)), y: -rand(0, 10), v: rand(95, 135), len: rand(14, 24), purple: Math.random() < 0.2 });
      if (on && Math.random() < dt * 1.6) drips.push({ x: rand(c.x + 30, c.x + c.w - 30), y: c.y + c.h + 1, v: 0, age: 0 });
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.y += d.v * dt;
        d.x -= d.v * dt * SL;
        if (d.y >= c.y) {
          if (d.x > c.x && d.x < c.x + c.w)
            for (let k = 0; k < 3; k++) sparks.push({ x: d.x, y: c.y - 1, vx: rand(-30, 30), vy: rand(-45, -20), age: 0 });
          drops.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        s.vy += 140 * dt;
        s.x += s.vx * dt;
        s.y = Math.min(c.y - 1, s.y + s.vy * dt);
        if (s.age > 0.6) sparks.splice(i, 1);
      }
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i];
        d.age += dt;
        if (d.age > 0.5) {
          d.v += 160 * dt; // hangs for a moment, then falls
          d.y += d.v * dt;
        }
        if (d.age > 1.4) drips.splice(i, 1);
      }
    },
    draw(ctx) {
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';
      for (const d of drops) {
        const g = ctx.createLinearGradient(d.x + d.len * SL, d.y - d.len, d.x, d.y);
        const col = d.purple ? accent[1] : accent[0];
        g.addColorStop(0, hexA(col, 0));
        g.addColorStop(1, hexA(col, v));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(d.x + d.len * SL, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      for (const s of sparks) {
        ctx.fillStyle = hexA(accent[0], (1 - s.age / 0.6) * v);
        ctx.fillRect(s.x, s.y, 2, 2);
      }
      for (const d of drips) {
        ctx.fillStyle = hexA(accent[0], Math.min(1, d.age * 3) * (1 - d.age / 1.4) * 0.8 * v);
        ctx.fillRect(d.x - 1, d.y, 2, 2 + Math.min(4, d.v / 40));
      }
      ctx.globalCompositeOperation = 'source-over';
    },
    idle: () => v === 0 && drops.length === 0 && sparks.length === 0 && drips.length === 0,
  };
};

const rating: Make = (_W, _H, c, accent) => {
  // "Rate us" is the router's whole job: five stars above the card's right end light up
  // one by one, then a few sparkles rise from them.
  type Sp = { x: number; y: number; vy: number; age: number; life: number };
  const sparks: Sp[] = [];
  let v = 0;
  let lit = 0; // 0..5, fractional while a star pops
  const R = 9;
  const cy = c.y - 17;
  const centres = Array.from({ length: 5 }, (_, i) => c.x + c.w - 24 - (4 - i) * R * 2.6);
  const star = (ctx: CanvasRenderingContext2D, cx: number, r: number) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  };
  return {
    update(dt, on) {
      v = ramp(v, on, dt);
      lit = on ? Math.min(5, lit + dt * 4) : Math.max(0, lit - dt * 6);
      if (on && lit >= 5 && Math.random() < dt * 7)
        sparks.push({ x: pick(centres) + rand(-R, R), y: cy - R * 0.6, vy: rand(-22, -12), age: 0, life: rand(0.8, 1.3) });
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        s.y += s.vy * dt;
        if (s.age > s.life) sparks.splice(i, 1);
      }
    },
    draw(ctx) {
      if (v > 0)
        centres.forEach((x, i) => {
          const k = clamp01(lit - i);
          const pop = k > 0 && k < 1 ? 1 + Math.sin(k * Math.PI) * 0.3 : 1;
          star(ctx, x, R * pop);
          ctx.fillStyle = k > 0 ? hexA(accent[0], 0.95 * v) : `rgba(232,228,220,${0.18 * v})`;
          ctx.fill();
        });
      for (const s of sparks) {
        ctx.fillStyle = hexA(accent[0], (1 - s.age / s.life) * v);
        ctx.fillRect(s.x, s.y, 2, 2);
      }
    },
    idle: () => v === 0 && sparks.length === 0,
  };
};

const EFFECTS: Record<FxKind, Make> = { flame, siren, stars, matrix, typing, parlamonium, rating };

export function attachFx(wrap: HTMLElement): void {
  const kind = wrap.dataset.fx as FxKind | undefined;
  const canvas = wrap.querySelector<HTMLCanvasElement>('canvas.row__fx');
  const card = wrap.querySelector<HTMLElement>('.row');
  if (!kind || !canvas || !card || !EFFECTS[kind]) return;
  if (!matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches) return;
  const style = getComputedStyle(wrap);
  const accent: [string, string] = [style.getPropertyValue('--a1').trim() || '#8cc8ec', style.getPropertyValue('--a2').trim() || '#a8cfae'];

  let on = false;
  let running = false;
  let effect: Effect;
  let ctx: CanvasRenderingContext2D;
  let W = 0;
  let H = 0;
  let cardRect: Rect;
  let radius = 0;

  const setup = () => {
    const r = card.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width + FX_PAD.x * 2;
    H = r.height + FX_PAD.y * 2;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx = canvas.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cardRect = { x: FX_PAD.x, y: FX_PAD.y, w: r.width, h: r.height };
    radius = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 0;
    effect = EFFECTS[kind](W, H, cardRect, accent);
  };

  const frame = (now: number, last: number, t0: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    const t = (now - t0) / 1000;
    effect.update(dt, on, t);
    ctx.clearRect(0, 0, W, H);
    // everything is drawn outside the card: clip = canvas minus the card's rounded rect
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.roundRect(cardRect.x, cardRect.y, cardRect.w, cardRect.h, radius);
    ctx.clip('evenodd');
    effect.draw(ctx, t);
    ctx.restore();
    if (!on && effect.idle()) {
      running = false;
      ctx.clearRect(0, 0, W, H);
      return;
    }
    requestAnimationFrame((n) => frame(n, now, t0));
  };

  const start = () => {
    on = true;
    if (running) return;
    running = true;
    setup();
    const now = performance.now();
    requestAnimationFrame((n) => frame(n, now, now));
  };
  const stop = () => (on = false);

  card.addEventListener('pointerenter', start);
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focus', start);
  card.addEventListener('blur', stop);
}
