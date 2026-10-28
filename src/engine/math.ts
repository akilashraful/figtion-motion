import { lerp } from './easing';

export const hash = (x: number, y: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

export function vnoise(x: number, y: number, s: number) {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    xf = x - xi,
    yf = y - yi,
    u = xf * xf * (3 - 2 * xf),
    v = yf * yf * (3 - 2 * yf);
  return lerp(
    lerp(hash(xi, yi, s), hash(xi + 1, yi, s), u),
    lerp(hash(xi, yi + 1, s), hash(xi + 1, yi + 1, s), u),
    v
  );
}

export const fbm = (x: number, y: number, s: number) =>
  (vnoise(x, y, s) * 0.5 + vnoise(x * 2, y * 2, s) * 0.25 + vnoise(x * 4, y * 4, s) * 0.125) /
  0.875;

export const rgba = (hex: string, a: number) => {
  if (!hex || hex[0] !== '#') return hex;
  const n = parseInt(hex.slice(1), 16);
  if (isNaN(n)) return hex;
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
};

export const hex3 = (h: string): [number, number, number] => {
  const n = parseInt(String(h).slice(1), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const lumaOf = (r: number, g: number, b: number) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255;
