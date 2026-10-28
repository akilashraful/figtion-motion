export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let lo = 0, hi = 1, u = t;
    for (let i = 0; i < 24; i++) {
      const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
      if (Math.abs(x - t) < 1e-5) break;
      if (x < t) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
}

export const EASE: Record<string, (t: number) => number> = {
  linear: t => t,
  easeIn: t => t * t * t,
  easeOut: t => 1 - Math.pow(1 - t, 3),
  easeInOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => {
    const c = 1.70158;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  bounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  }
};

export const PE: Record<string, (t: number, i: number) => number> = {
  smooth: (t, i) => {
    const p = 1 + 2.5 * i;
    return t < 0.5 ? 0.5 * Math.pow(2 * t, p) : 1 - 0.5 * Math.pow(2 * (1 - t), p);
  },
  natural: (t, i) =>
    bezier(lerp(0.333, 0.25, i), lerp(0.333, 0.1, i), lerp(0.667, 0.25, i), lerp(0.667, 1, i))(t),
  slowDown: (t, i) => 1 - Math.pow(1 - t, 1 + 3 * i),
  accelerate: (t, i) => Math.pow(t, 1 + 3 * i),
  elastic: (t, i) =>
    1 - Math.pow(2, -10 * t) * Math.cos(t * 10 * (2 * Math.PI / (3.4 - 2 * i))),
  bounceP: (t, i) => {
    const e = 0.3 + 0.5 * i,
      T0 = 1 / (1 + 2 * (e + e * e + e * e * e));
    if (t < T0) {
      const u = t / T0;
      return u * u;
    }
    let s = T0;
    for (let k = 1; k <= 3; k++) {
      const dur = 2 * Math.pow(e, k) * T0;
      if (t < s + dur) {
        const x = (t - s) / dur;
        return 1 - Math.pow(e, 2 * k) * 4 * x * (1 - x);
      }
      s += dur;
    }
    return 1;
  },
  overshoot: (t, i) => {
    const c = 1.70158 * 2 * i + 0.0001;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  },
  impulse: (t, i) => {
    const k = 6 + 14 * i;
    return (1 - Math.pow(2, -k * t)) / (1 - Math.pow(2, -k));
  },
  swing: (t, i) => {
    const c = 1.70158 * 1.525 * 2 * i + 0.0001;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2;
  }
};

export function ease(name: string, i?: number, u: number = 0): number {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const f = PE[name];
  if (f) return f(u, (i == null ? 50 : i) / 100);
  return (EASE[name] || EASE.easeInOut)(u);
}
