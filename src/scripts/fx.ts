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
//   beacon       Leeway           lighthouse on the top-left corner, beam reaches forward, ships sail right
//   rating       Kumpircim        five stars above the card light up one by one
export type FxKind = 'flame' | 'siren' | 'stars' | 'matrix' | 'typing' | 'beacon' | 'rating';

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

const beacon: Make = (_W, _H, c, accent) => {
  // A small lighthouse stands on the card's top-left corner and its beam reaches forward
  // along the top edge (grows out while hovered, sways a little). Ships sail rightwards on
  // the top edge at random intervals and catch the light while they are inside the beam.
  type Sh = { x: number; v: number; len: number; tall: number; age: number };
  const ships: Sh[] = [];
  const sea = c.y - 1; // the card's top edge is the waterline
  const lx = c.x + 18; // lighthouse x
  const lampY = sea - 23;
  let v = 0;
  let reach = 0;
  let next = rand(0.3, 1.2);
  const tower = (ctx: CanvasRenderingContext2D, a: number) => {
    ctx.fillStyle = hexA(accent[1], 0.9 * a);
    ctx.beginPath();
    ctx.moveTo(lx - 5, sea);
    ctx.lineTo(lx - 3, lampY + 4);
    ctx.lineTo(lx + 3, lampY + 4);
    ctx.lineTo(lx + 5, sea);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(lx - 4, lampY + 2, 8, 2); // gallery
    ctx.fillRect(lx - 2, lampY - 4, 4, 1.5); // roof
    ctx.fillStyle = hexA(accent[0], a);
    ctx.fillRect(lx - 2, lampY - 2.5, 4, 4.5); // lamp
  };
  const shipPath = (ctx: CanvasRenderingContext2D, s: Sh) => {
    const x = s.x;
    const y = sea;
    ctx.beginPath(); // hull: flat stern, raked bow pointing right
    ctx.moveTo(x - s.len / 2, y - 4);
    ctx.lineTo(x + s.len / 2 + 3, y - 4);
    ctx.lineTo(x + s.len / 2 - 1, y);
    ctx.lineTo(x - s.len / 2 + 1, y);
    ctx.closePath();
    ctx.rect(x - s.len / 2 + 2, y - 4 - s.tall, s.len * 0.28, s.tall); // bridge aft
    ctx.rect(x - s.len / 2 + 4, y - 7 - s.tall, 1.5, 3); // mast
  };
  // lit = the silhouette itself picks up the beam colour (no box around it)
  const ship = (ctx: CanvasRenderingContext2D, s: Sh, a: number, lit: number) => {
    shipPath(ctx, s);
    ctx.fillStyle = hexA(accent[1], 0.75 * a);
    ctx.fill();
    if (lit > 0) {
      ctx.fillStyle = hexA(accent[0], 0.6 * lit * a);
      ctx.fill();
    }
  };
  const spawn = (x: number, age: number) => {
    const len = rand(18, 30);
    ships.push({ x, v: rand(22, 38), len, tall: rand(3, 5), age });
  };
  return {
    update(dt, on) {
      v = ramp(v, on, dt);
      reach = on ? Math.min(1, reach + dt / 0.9) : Math.max(0, reach - dt / 0.7);
      next -= dt;
      // a hover that starts on an empty sea finds ships already underway: one mid-way, one near the end
      if (on && ships.length === 0 && v < 0.2) {
        const span = c.x + c.w - lx;
        spawn(lx + span * rand(0.35, 0.55), 1);
        spawn(lx + span * rand(0.78, 0.92), 1);
        next = rand(0.4, 1.4);
      }
      if (on && next <= 0) {
        spawn(lx - 10, 0);
        next = rand(1.6, 4.2);
      }
      for (let i = ships.length - 1; i >= 0; i--) {
        const s = ships[i];
        s.x += s.v * dt;
        s.age += dt;
        if (s.x - s.len > c.x + c.w + FX_PAD.x) ships.splice(i, 1);
      }
      if (!on && v === 0) ships.length = 0;
    },
    draw(ctx, t) {
      if (v === 0) return;
      const sway = Math.sin(t * 0.9) * 0.035; // radians
      const len = (c.w - 30) * (1 - Math.pow(1 - reach, 3));
      const halfAt = (d: number) => 2 + d * 0.07; // beam half-height at distance d
      ctx.globalCompositeOperation = 'lighter';
      if (len > 1) {
        const tx = lx + Math.cos(sway) * len;
        const ty = lampY + Math.sin(sway) * len;
        const g = ctx.createLinearGradient(lx, lampY, tx, ty);
        g.addColorStop(0, hexA(accent[0], 0.6 * v));
        g.addColorStop(0.6, hexA(accent[0], 0.22 * v));
        g.addColorStop(1, hexA(accent[0], 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(lx, lampY - 1.5);
        ctx.lineTo(tx, ty - halfAt(len));
        ctx.lineTo(tx, ty + halfAt(len));
        ctx.lineTo(lx, lampY + 1.5);
        ctx.closePath();
        ctx.fill();
        const glow = ctx.createRadialGradient(lx, lampY, 0, lx, lampY, 14);
        glow.addColorStop(0, hexA(accent[0], 0.7 * v));
        glow.addColorStop(1, hexA(accent[0], 0));
        ctx.fillStyle = glow;
        ctx.fillRect(lx - 14, lampY - 14, 28, 28);
      }
      ctx.globalCompositeOperation = 'source-over';
      tower(ctx, v);
      for (const s of ships) {
        const d = s.x - lx;
        // lit while the beam (which runs a few px above the waterline) reaches the ship
        const lit = d > 0 && d < len ? clamp01(1 - d / (c.w - 30)) * v : 0;
        ship(ctx, s, Math.min(1, s.age * 2) * v, lit);
      }
    },
    idle: () => v === 0 && reach === 0 && ships.length === 0,
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

const EFFECTS: Record<FxKind, Make> = { flame, siren, stars, matrix, typing, beacon, rating };

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
