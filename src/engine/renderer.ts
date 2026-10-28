import { Layer, Scene } from './types';
import { CANVAS_W, CANVAS_H, PROPS } from './constants';
import { ease } from './easing';
import { boxSize, setFont } from './textLayout';
import { rgba } from './math';
import { layerFx } from './effects';

export const imageCache: Record<string, HTMLImageElement> = {};

export function getImage(src?: string): HTMLImageElement | null {
  if (!src) return null;
  if (!imageCache[src]) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imageCache[src] = img;
  }
  return imageCache[src];
}

export function valueAt(l: Layer, p: string, time: number): any {
  const ks = l.tracks?.[p];
  if (!ks || !ks.length) return (l as any)[p];
  if (time <= ks[0].t) return ks[0].v;
  const last = ks[ks.length - 1];
  if (time >= last.t) return last.v;
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (time >= a.t && time <= b.t) {
      const u = (time - a.t) / (b.t - a.t);
      const e = ease(b.ease || 'easeInOut', b.ei, u);
      if (typeof a.v === 'number' && typeof b.v === 'number') {
        return a.v + (b.v - a.v) * e;
      }
      return u >= 0.5 ? b.v : a.v;
    }
  }
  return (l as any)[p];
}

export function layerState(l: Layer, time: number): Record<string, any> {
  const s: Record<string, any> = {};
  PROPS.forEach(p => (s[p] = valueAt(l, p, time)));
  return s;
}

export function drawLayer(
  c: CanvasRenderingContext2D,
  l: Layer,
  s: Record<string, any>,
  time: number
) {
  if (l.hidden) return;
  const bx = boxSize(l, s);
  const w = bx.w;
  const h = bx.h;

  c.save();
  c.translate(s.x, s.y);
  c.rotate(((s.rot || 0) * Math.PI) / 180);
  c.scale(s.scale ?? 1, s.scale ?? 1);
  c.globalAlpha = Math.max(0, Math.min(1, (s.opacity ?? 1)));

  // Shadow
  if (s.shadow && s.shadow > 0) {
    c.shadowColor = rgba(s.shColor || '#000000', s.shOp ?? 0.5);
    c.shadowBlur = s.shadow;
    c.shadowOffsetX = s.shX || 0;
    c.shadowOffsetY = s.shY || 14;
  }

  // Draw Shape types
  if (l.type === 'rect') {
    const cr = Math.min(Math.min(w, h) / 2, s.cr || 0);
    c.beginPath();
    if (c.roundRect) {
      c.roundRect(-w / 2, -h / 2, w, h, cr);
    } else {
      c.rect(-w / 2, -h / 2, w, h);
    }
    if (l.fillOn !== false) {
      c.fillStyle = s.colT ? s.colorTo || l.fill : l.fill;
      c.fill();
    }
    if (s.strokeW && s.strokeW > 0) {
      c.lineWidth = s.strokeW;
      c.strokeStyle = s.stroke || '#000';
      c.stroke();
    }
  } else if (l.type === 'ellipse') {
    c.beginPath();
    c.ellipse(0, 0, Math.max(0.5, w / 2), Math.max(0.5, h / 2), 0, 0, Math.PI * 2);
    if (l.fillOn !== false) {
      c.fillStyle = s.colT ? s.colorTo || l.fill : l.fill;
      c.fill();
    }
    if (s.strokeW && s.strokeW > 0) {
      c.lineWidth = s.strokeW;
      c.strokeStyle = s.stroke || '#000';
      c.stroke();
    }
  } else if (l.type === 'star') {
    const pts = l.points || 5;
    const ir = l.ir ?? 0.45;
    const R = Math.min(w, h) / 2;
    const r = R * ir;
    c.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const rad = (i * Math.PI) / pts - Math.PI / 2;
      const dist = i % 2 === 0 ? R : r;
      const px = Math.cos(rad) * dist;
      const py = Math.sin(rad) * dist;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    if (l.fillOn !== false) {
      c.fillStyle = s.colT ? s.colorTo || l.fill : l.fill;
      c.fill();
    }
    if (s.strokeW && s.strokeW > 0) {
      c.lineWidth = s.strokeW;
      c.strokeStyle = s.stroke || '#000';
      c.stroke();
    }
  } else if (l.type === 'polygon') {
    const sides = l.sides || 6;
    const R = Math.min(w, h) / 2;
    c.beginPath();
    for (let i = 0; i < sides; i++) {
      const rad = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const px = Math.cos(rad) * R;
      const py = Math.sin(rad) * R;
      if (i === 0) c.moveTo(px, py);
      else c.lineTo(px, py);
    }
    c.closePath();
    if (l.fillOn !== false) {
      c.fillStyle = s.colT ? s.colorTo || l.fill : l.fill;
      c.fill();
    }
    if (s.strokeW && s.strokeW > 0) {
      c.lineWidth = s.strokeW;
      c.strokeStyle = s.stroke || '#000';
      c.stroke();
    }
  } else if (l.type === 'text') {
    setFont(c, l, s.h, s);
    c.fillStyle = s.colT ? s.colorTo || l.fill : l.fill;
    c.textAlign = l.align || 'left';
    c.textBaseline = 'middle';
    const lay = (bx as any).lay;
    if (lay) {
      const xStart = l.align === 'center' ? 0 : l.align === 'right' ? w / 2 : -w / 2;
      const yStart = -lay.th / 2 + lay.lh / 2;
      lay.lines.forEach((line: string, idx: number) => {
        c.fillText(line, xStart, yStart + idx * lay.lh);
      });
    }
  } else if (l.type === 'image' && l.src) {
    const img = getImage(l.src);
    if (img && img.complete) {
      c.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      c.fillStyle = '#2c2e35';
      c.fillRect(-w / 2, -h / 2, w, h);
    }
  } else if (l.type === 'path' && l.pointsList && l.pointsList.length > 1) {
    c.beginPath();
    c.moveTo(l.pointsList[0].x - s.x, l.pointsList[0].y - s.y);
    for (let i = 1; i < l.pointsList.length; i++) {
      c.lineTo(l.pointsList[i].x - s.x, l.pointsList[i].y - s.y);
    }
    if (l.fillOn) {
      c.fillStyle = l.fill;
      c.fill();
    }
    c.lineWidth = s.strokeW || 2;
    c.strokeStyle = s.stroke || '#7a3ff2';
    c.stroke();
  }

  c.restore();
}

export function drawHandles(
  c: CanvasRenderingContext2D,
  l: Layer,
  s: Record<string, any>
) {
  const bx = boxSize(l, s);
  const w = bx.w * (s.scale ?? 1);
  const h = bx.h * (s.scale ?? 1);

  c.save();
  c.translate(s.x, s.y);
  c.rotate(((s.rot || 0) * Math.PI) / 180);

  // Bounding outline
  c.strokeStyle = '#7a3ff2';
  c.lineWidth = 1.5;
  c.strokeRect(-w / 2, -h / 2, w, h);

  // 8 handles
  const handles = [
    [-w / 2, -h / 2],
    [0, -h / 2],
    [w / 2, -h / 2],
    [w / 2, 0],
    [w / 2, h / 2],
    [0, h / 2],
    [-w / 2, h / 2],
    [-w / 2, 0]
  ];

  c.fillStyle = '#ffffff';
  c.lineWidth = 1.5;
  handles.forEach(([hx, hy]) => {
    c.fillRect(hx - 4, hy - 4, 8, 8);
    c.strokeRect(hx - 4, hy - 4, 8, 8);
  });

  c.restore();
}

export function render(
  c: CanvasRenderingContext2D,
  scene: Scene,
  time: number,
  isExport = false,
  scale = 1,
  offX = 0,
  offY = 0,
  selectedIds: Set<number> = new Set()
) {
  const width = scene.w || CANVAS_W;
  const height = scene.h || CANVAS_H;

  c.save();
  c.translate(offX, offY);
  c.scale(scale, scale);

  // Background
  c.fillStyle = scene.bg || '#ffffff';
  c.fillRect(0, 0, width, height);

  // Layers
  const layers = scene.layers || [];
  layers.forEach(l => {
    const s = layerState(l, time);
    drawLayer(c, l, s, time);
  });

  // Selection outline handles (if not export)
  if (!isExport && selectedIds.size > 0) {
    layers.forEach(l => {
      if (selectedIds.has(l.id)) {
        const s = layerState(l, time);
        drawHandles(c, l, s);
      }
    });
  }

  c.restore();
}
