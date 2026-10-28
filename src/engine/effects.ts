import { Layer } from './types';
import { clamp01, ease, lerp } from './easing';
import { fbm, hash, lumaOf, rgba, vnoise } from './math';
import { DIRS } from './constants';

const POOL = typeof document !== 'undefined'
  ? [0, 1, 2].map(() => {
      const c = document.createElement('canvas');
      c.getContext('2d', { willReadFrequently: true });
      return c;
    })
  : [];

const SCR = typeof document !== 'undefined' ? document.createElement('canvas') : null;
if (SCR) SCR.getContext('2d', { willReadFrequently: true });

export function cvFor(i: number, w: number, h: number): HTMLCanvasElement {
  const c = POOL[i] || document.createElement('canvas');
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  } else {
    c.getContext('2d')?.clearRect(0, 0, w, h);
  }
  return c;
}

export function freeCv(src: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  for (let i = 0; i < 3; i++) {
    if (POOL[i] !== src) return cvFor(i, w, h);
  }
  return cvFor(0, w, h);
}

export function scratch(w: number, h: number): HTMLCanvasElement {
  if (!SCR) return cvFor(0, w, h);
  if (SCR.width !== w || SCR.height !== h) {
    SCR.width = w;
    SCR.height = h;
  } else {
    SCR.getContext('2d')?.clearRect(0, 0, w, h);
  }
  return SCR;
}

export function mapPx(I: any, fn: (D: Uint8ClampedArray, p: number, x: number, y: number) => void): HTMLCanvasElement {
  const { w, h } = I;
  const ctx = I.src.getContext('2d');
  const d = ctx.getImageData(0, 0, w, h);
  const D = d.data;
  for (let p = 0, i = 0; p < D.length; p += 4, i++) {
    fn(D, p, i % w, (i / w) | 0);
  }
  const out = freeCv(I.src, w, h);
  out.getContext('2d')?.putImageData(d, 0, 0);
  return out;
}

export function warp(I: any, fn: (x: number, y: number, pt: [number, number]) => void): HTMLCanvasElement {
  const { w, h } = I;
  const S = I.src.getContext('2d').getImageData(0, 0, w, h).data;
  const out = freeCv(I.src, w, h);
  const o = out.getContext('2d');
  if (!o) return out;
  const od = o.createImageData(w, h);
  const D = od.data;
  const pt: [number, number] = [0, 0];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      fn(x, y, pt);
      const sx = pt[0], sy = pt[1];
      const x0 = Math.floor(sx), y0 = Math.floor(sy);
      if (x0 < -1 || y0 < -1 || x0 >= w || y0 >= h) continue;
      const fx = sx - x0, fy = sy - y0;
      let R = 0, G = 0, B = 0, A = 0;
      for (let j = 0; j < 2; j++) {
        for (let i = 0; i < 2; i++) {
          const xx = x0 + i, yy = y0 + j;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const p = (yy * w + xx) * 4;
          const a = (S[p + 3] / 255) * (i ? fx : 1 - fx) * (j ? fy : 1 - fy);
          R += S[p] * a;
          G += S[p + 1] * a;
          B += S[p + 2] * a;
          A += a;
        }
      }
      if (A > 0) {
        const q = (y * w + x) * 4;
        D[q] = R / A;
        D[q + 1] = G / A;
        D[q + 2] = B / A;
        D[q + 3] = A * 255;
      }
    }
  }
  o.putImageData(od, 0, 0);
  return out;
}

const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a || 1e-6));
  return t * t * (3 - 2 * t);
};

export const PA = (k: string, label: string, kind: string, def: any, o: any = {}) => ({
  k,
  label,
  kind,
  def,
  ...o
});

export const FXLIB: Record<string, any> = {
  pixelate: {
    label: 'Pixelate',
    kind: 'static',
    params: [
      PA('pixelSize', 'Pixel Size', 'num', 18, { min: 1, max: 200 }),
      PA('pixelSizeStep', 'Pixel Size Step', 'num', 1, { min: 1, max: 50, step: 1 })
    ],
    apply(I: any) {
      const st = Math.max(1, I.p.pixelSizeStep);
      const sz = Math.max(1, Math.round(I.p.pixelSize / st) * st);
      const sw = Math.max(1, Math.round(I.w / sz));
      const sh = Math.max(1, Math.round(I.h / sz));
      const sc = scratch(sw, sh);
      const s = sc.getContext('2d');
      if (!s) return I.src;
      s.imageSmoothingEnabled = true;
      s.drawImage(I.src, 0, 0, sw, sh);
      const out = freeCv(I.src, I.w, I.h);
      const o = out.getContext('2d');
      if (!o) return out;
      o.imageSmoothingEnabled = false;
      o.drawImage(sc, 0, 0, sw, sh, 0, 0, I.w, I.h);
      return out;
    }
  },
  rgbshift: {
    label: 'RGB Shift',
    kind: 'static',
    params: [
      PA('amount', 'Amount', 'num', 0.25, { min: 0, max: 3, step: 0.01 }),
      PA('direction', 'Direction', 'num', 0, { min: -360, max: 360 })
    ],
    pad: (p: any, b: any) => p.amount * 0.05 * Math.min(b.w, b.h),
    apply(I: any) {
      const { w, h } = I;
      const rad = ((I.p.direction || 0) * Math.PI) / 180;
      const dist = I.p.amount * 20;
      const dx = Math.cos(rad) * dist, dy = Math.sin(rad) * dist;
      const out = freeCv(I.src, w, h);
      const o = out.getContext('2d');
      if (!o) return out;
      o.globalCompositeOperation = 'screen';
      o.drawImage(I.src, dx, dy);
      o.drawImage(I.src, -dx, -dy);
      o.globalCompositeOperation = 'source-over';
      return out;
    }
  },
  flutedglass: {
    label: 'Fluted Glass',
    kind: 'static',
    params: [
      PA('numColumns', 'Columns', 'num', 12, { min: 1, max: 40, step: 1 }),
      PA('strength', 'Strength', 'num', 0.45, { min: 0, max: 1, step: 0.01 })
    ],
    apply(I: any) {
      const sw = I.w / Math.max(1, I.p.numColumns);
      const P = I.p;
      return warp(I, (x, y, pt) => {
        const u = (x % sw) / sw - 0.5;
        pt[0] = x + u * P.strength * sw * 1.6;
        pt[1] = y;
      });
    }
  },
  echoes: {
    label: 'Echoes',
    kind: 'static',
    params: [
      PA('scale', 'Scale', 'num', 12, { min: 1, max: 100 }),
      PA('n', 'Copies', 'num', 5, { min: 1, max: 12, step: 1 }),
      PA('fade', 'Fade', 'bool', true)
    ],
    pad: (p: any, b: any) => (Math.max(b.w, b.h) * p.n * p.scale) / 200,
    apply(I: any) {
      const out = freeCv(I.src, I.w, I.h);
      const o = out.getContext('2d');
      if (!o) return out;
      const n = Math.round(I.p.n);
      for (let i = n; i >= 1; i--) {
        o.save();
        o.globalAlpha = I.p.fade ? (1 - i / (n + 1)) * 0.6 : 0.4;
        const sc = 1 + (i * I.p.scale) / 100;
        o.translate(I.w / 2, I.h / 2);
        o.scale(sc, sc);
        o.translate(-I.w / 2, -I.h / 2);
        o.drawImage(I.src, 0, 0);
        o.restore();
      }
      o.drawImage(I.src, 0, 0);
      return out;
    }
  },
  wiggle: {
    label: 'Wiggle',
    kind: 'static',
    params: [
      PA('wiggleX', 'Wiggle X', 'num', 4, { min: 0, max: 200 }),
      PA('wiggleY', 'Wiggle Y', 'num', 4, { min: 0, max: 200 }),
      PA('speed', 'Speed', 'num', 3, { min: 0, max: 20, step: 0.1 })
    ],
    pad: (p: any) => Math.max(p.wiggleX, p.wiggleY) * 1.5,
    apply(I: any) {
      const P = I.p;
      const t = I.time * P.speed * 0.5;
      const nx = (vnoise(t, 1.2, 1) - 0.5) * 2 * P.wiggleX;
      const ny = (vnoise(t + 4.5, 3.4, 2) - 0.5) * 2 * P.wiggleY;
      const out = freeCv(I.src, I.w, I.h);
      const o = out.getContext('2d');
      if (!o) return out;
      o.drawImage(I.src, nx, ny);
      return out;
    }
  },
  dissolve: {
    label: 'Dissolve',
    kind: 'trans',
    params: [PA('scale', 'Scale', 'num', 10, { min: 1, max: 100 })],
    apply(I: any) {
      const pr = I.progress;
      const cell = Math.max(1, I.p.scale * 0.5);
      return mapPx(I, (D, p, x, y) => {
        const hh = hash((x / cell) | 0, (y / cell) | 0, I.seed || 1);
        D[p + 3] *= clamp01((pr - hh) / 0.1);
      });
    }
  },
  noisedissolve: {
    label: 'Noise Dissolve',
    kind: 'trans',
    params: [PA('scale', 'Scale', 'num', 1, { min: 0.1, max: 3, step: 0.1 })],
    apply(I: any) {
      const pr = I.progress;
      const sc = Math.max(4, 40 * I.p.scale);
      return mapPx(I, (D, p, x, y) => {
        const n = fbm(x / sc, y / sc, 4);
        D[p + 3] *= clamp01((pr - n) / 0.1);
      });
    }
  },
  glitch: {
    label: 'Glitch',
    kind: 'trans',
    params: [PA('intensity', 'Intensity', 'num', 0.5, { min: 0, max: 1, step: 0.05 })],
    apply(I: any) {
      const pr = I.progress;
      const out = freeCv(I.src, I.w, I.h);
      const o = out.getContext('2d');
      if (!o) return out;
      o.drawImage(I.src, 0, 0);
      if (pr > 0.05 && pr < 0.95) {
        const slices = 8;
        const sh = I.h / slices;
        for (let i = 0; i < slices; i++) {
          if (hash(i, Math.floor(I.time * 10), 9) > 0.4) {
            const dx = (hash(i, 2, 7) - 0.5) * 40 * I.p.intensity * (1 - pr);
            o.drawImage(I.src, 0, i * sh, I.w, sh, dx, i * sh, I.w, sh);
          }
        }
      }
      return out;
    }
  }
};

export const defaultsOf = (params: any[]) => {
  const p: Record<string, any> = {};
  params.forEach(q => (p[q.k] = q.def));
  return p;
};

export function layerFx(l: Layer, time: number) {
  const out: any[] = [];
  (l.effects || []).forEach(e => {
    const d = FXLIB[e.id];
    if (d && e.on !== false) {
      out.push({ def: d, p: { ...defaultsOf(d.params), ...e.p }, progress: 1 });
    }
  });
  return out;
}
