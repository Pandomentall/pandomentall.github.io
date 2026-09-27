// Parlavan: Ellam's semi-biological Parlamonium eaters (see Ellam Rogue GDD,
// 04_karakterler/parlavan.md). Pixel sprite, facing right, 17x9, two frames:
// A = mandibles open, B = mandibles closed. Crystals on the back are Parlamonium.
export const SPRITE_W = 17;
export const SPRITE_H = 9;

const FRAME_A = [
  '....G...G........',
  '...GY..GY....L...',
  '..DPPDPPPDPPP.L..',
  '.DPPPDPPPDPPPP...',
  'DPPPPDPPPDPPPEPMM',
  'DPPPPDPPPDPPPPP..',
  '.DPPPDPPPDPPPPPMM',
  '..L.L..L.L..L....',
  '.L...L..L..L.L...',
];

const FRAME_B = [
  '....G...G........',
  '...GY..GY....L...',
  '..DPPDPPPDPPP.L..',
  '.DPPPDPPPDPPPP...',
  'DPPPPDPPPDPPPEP..',
  'DPPPPDPPPDPPPPPMM',
  '.DPPPDPPPDPPPPP..',
  '...L.L..L.L.L....',
  '..L..L.L...L.L...',
];

const PALETTE: Record<string, string> = {
  P: '#b9a2f5', // body
  D: '#7862be', // segment / shadow
  L: '#9682d2', // legs, antenna
  G: '#f2c572', // Parlamonium crystal
  Y: '#ffecb4', // crystal highlight
  E: '#262e39', // eye
  M: '#e8e4dc', // mandibles
};

type Frame = { color: string; x: number; y: number }[];

const compile = (rows: string[]): Frame =>
  rows.flatMap((row, y) =>
    [...row].flatMap((c, x) => (PALETTE[c] ? [{ color: PALETTE[c], x, y }] : [])),
  );

export const FRAMES: [Frame, Frame] = [compile(FRAME_A), compile(FRAME_B)];

export function drawParlavan(
  ctx: CanvasRenderingContext2D,
  frame: 0 | 1,
  x: number,
  y: number,
  scale: number,
): void {
  for (const px of FRAMES[frame]) {
    ctx.fillStyle = px.color;
    ctx.fillRect(Math.round(x + px.x * scale), Math.round(y + px.y * scale), scale, scale);
  }
}

// Canvas sized in CSS pixels, drawn at device resolution.
export function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
