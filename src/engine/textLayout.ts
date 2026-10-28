import { Layer } from './types';

const mcanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const mctx = mcanvas ? mcanvas.getContext('2d') : null;

export function setFont(c: CanvasRenderingContext2D, l: Layer, fs: number, st?: any) {
  c.font = `${l.italic ? 'italic ' : ''}${l.weight || 400} ${Math.max(1, fs)}px ${l.font || 'system-ui'}`;
  if ('letterSpacing' in c) {
    (c as any).letterSpacing = `${((st && st.ls != null ? st.ls : l.ls || 0) * fs) / 100}px`;
  }
}

export const caseText = (l: Layer, x: string) =>
  l.tcase === 'upper' ? x.toUpperCase() : l.tcase === 'lower' ? x.toLowerCase() : x;

export const counterStr = (l: Layer, n: number) => {
  const c = l.counter || {};
  return (
    (c.prefix || '') +
    (Number(n) || 0).toFixed(Math.max(0, c.dec || 0)) +
    (c.suffix || '')
  );
};

export interface TextLayoutResult {
  lines: string[];
  lh: number;
  th: number;
  width: number;
  height: number;
}

export function textLayout(
  l: Layer,
  fs: number,
  w: number,
  txt?: string | null,
  st?: any
): TextLayoutResult {
  fs = Math.max(1, fs);
  if (mctx) setFont(mctx, l, fs, st);
  const wrap = l.autoResize !== 'width';
  const lines: string[] = [];
  const textContent = caseText(l, String(txt != null ? txt : l.text || ''));

  textContent.split('\n').forEach(par => {
    if (!wrap || !mctx) {
      lines.push(par);
      return;
    }
    let cur = '';
    par.split(' ').forEach(wd => {
      const test = cur ? cur + ' ' + wd : wd;
      if (cur && mctx.measureText(test).width > w) {
        lines.push(cur);
        cur = wd;
      } else {
        cur = test;
      }
    });
    lines.push(cur);
  });

  const lh = (fs * (st && st.lh != null ? st.lh : l.lh || 120)) / 100;
  const th = lines.length * lh;
  const width = wrap
    ? Math.max(1, w)
    : Math.max(1, ...lines.map(x => (mctx ? mctx.measureText(x).width : x.length * (fs * 0.6))));

  return {
    lines,
    lh,
    th,
    width,
    height: l.autoResize === 'fixed' ? l.bh || th : th
  };
}

export const textFor = (l: Layer, s: any) =>
  l.counter
    ? counterStr(l, s.num)
    : s.tsw >= 0.5 && l.swaps && l.swaps.length
    ? l.swaps[Math.min(l.swaps.length, Math.round(s.tsw)) - 1]
    : null;

export function boxSize(l: Layer, s: any) {
  if (l.type !== 'text') return { w: s.w, h: s.h };
  const lay = textLayout(l, s.h, s.w, textFor(l, s), s);
  return { w: lay.width, h: lay.height, lay };
}

export function fitText(l: Layer) {
  if (l.type === 'text' && l.autoResize === 'width') {
    l.w = Math.round(textLayout(l, l.h, l.w).width);
  }
}
