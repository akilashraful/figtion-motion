import { Layer, AnimationSpec, Keyframe } from './types';
import { DIRS, PROPS } from './constants';
import { ease, lerp } from './easing';

export const ANIM_LABELS: Record<string, string> = {
  Fade: 'Fade',
  Slide: 'Slide',
  Scale: 'Scale',
  Grow: 'Grow',
  Shrink: 'Shrink',
  MoveScale: 'Move & Scale',
  Spin: 'Spin',
  Twist: 'Twist',
  Blur: 'Blur',
  BlurScale: 'Blur & Scale',
  BlurSlide: 'Blur & Slide',
  Bounce: 'Bounce',
  Wipe: 'Wipe / Mask',
  Show: 'Instant Show',
  TextAppear: 'Text Appear',
  TextFade: 'Text Fade',
  TextScale: 'Text Scale',
  TextSlide: 'Text Slide',
  TextBlur: 'Text Blur',
  Move: 'Move',
  Rotate: 'Rotate',
  ScaleTo: 'Scale To',
  Resize: 'Resize',
  Opacity: 'Opacity',
  ShadowTo: 'Shadow',
  StrokeTo: 'Stroke',
  Arc: 'Arc',
  Counter: 'Counter',
  ColorTo: 'Color',
  Pulse: 'Pulse',
  Shake: 'Shake',
  Wobble: 'Wobble',
  Float: 'Float',
  Flash: 'Flash',
  Heartbeat: 'Heartbeat',
  Glow: 'Glow Pulse',
  Dissolve: 'Dissolve',
  Glitch: 'Glitch'
};

export interface PresetDef {
  modes?: boolean;
  ease?: string;
  params: any[];
  text?: boolean;
  fx?: boolean;
  gen: (a: AnimationSpec, r: any, d: number, E: string, m: boolean, seg: any, X?: any) => Record<string, any>;
}

export const ANIMS: Record<string, PresetDef> = {
  Fade: {
    modes: true,
    ease: 'slowDown',
    params: [],
    gen: (a, r, d, E, m, seg) => ({ opacity: seg(0, r.opacity) })
  },
  Slide: {
    modes: true,
    ease: 'slowDown',
    params: [
      { k: 'by', label: 'Slide by', kind: 'num', def: 150 },
      { k: 'dir', label: 'Direction', kind: 'dir', def: 'up' },
      { k: 'fade', label: 'Fade', kind: 'bool', def: true }
    ],
    gen: (a, r, d, E, m, seg) => {
      const v = DIRS[a.p?.dir || 'up'] || DIRS.up;
      const s = m ? -1 : 1;
      const fr: Record<string, any> = {};
      const by = a.p?.by ?? 150;
      if (v[0]) fr.x = seg(r.x + s * v[0] * by, r.x);
      if (v[1]) fr.y = seg(r.y + s * v[1] * by, r.y);
      if (a.p?.fade !== false) fr.opacity = seg(0, r.opacity);
      return fr;
    }
  },
  Grow: {
    modes: true,
    ease: 'slowDown',
    params: [{ k: 'from', label: 'Grow from %', kind: 'num', def: 50 }],
    gen: (a, r, d, E, m, seg) => ({
      scale: seg((r.scale * (a.p?.from ?? 50)) / 100, r.scale),
      opacity: seg(0, r.opacity)
    })
  },
  Shrink: {
    modes: true,
    ease: 'slowDown',
    params: [{ k: 'from', label: 'Shrink from %', kind: 'num', def: 150 }],
    gen: (a, r, d, E, m, seg) => ({
      scale: seg((r.scale * (a.p?.from ?? 150)) / 100, r.scale),
      opacity: seg(0, r.opacity)
    })
  },
  Spin: {
    modes: true,
    ease: 'slowDown',
    params: [
      { k: 'angle', label: 'Angle', kind: 'num', def: 180 },
      { k: 'dir', label: 'Direction', kind: 'dir', def: 'cw' }
    ],
    gen: (a, r, d, E, m, seg) => {
      const sg = (a.p?.dir === 'ccw' ? -1 : 1) * (m ? -1 : 1);
      const ang = a.p?.angle ?? 180;
      return {
        rot: seg(r.rot + sg * ang, r.rot),
        opacity: seg(0, r.opacity)
      };
    }
  },
  Bounce: {
    modes: true,
    ease: 'bounceP',
    params: [{ k: 'by', label: 'Drop height', kind: 'num', def: 320 }],
    gen: (a, r, d, E, m, seg) => ({
      y: seg(r.y + (m ? -1 : 1) * (a.p?.by ?? 320), r.y),
      opacity: seg(0, r.opacity)
    })
  },
  Move: {
    modes: false,
    ease: 'smooth',
    params: [
      { k: 'dist', label: 'Distance', kind: 'num', def: 200 },
      { k: 'dir', label: 'Direction', kind: 'dir', def: 'right' }
    ],
    gen: (a, r, d, E) => {
      const v = DIRS[a.p?.dir || 'right'] || DIRS.right;
      const fr: Record<string, any> = {};
      const dist = a.p?.dist ?? 200;
      if (v[0]) fr.x = [[0, r.x], [d, r.x + v[0] * dist, E]];
      if (v[1]) fr.y = [[0, r.y], [d, r.y + v[1] * dist, E]];
      return fr;
    }
  },
  Rotate: {
    modes: false,
    ease: 'smooth',
    params: [{ k: 'angle', label: 'Angle', kind: 'num', def: 360 }],
    gen: (a, r, d, E) => ({
      rot: [[0, r.rot], [d, r.rot + (a.p?.angle ?? 360), E]]
    })
  },
  ScaleTo: {
    modes: false,
    ease: 'smooth',
    params: [{ k: 'to', label: 'Scale to %', kind: 'num', def: 150 }],
    gen: (a, r, d, E) => ({
      scale: [[0, r.scale], [d, (r.scale * (a.p?.to ?? 150)) / 100, E]]
    })
  },
  Pulse: {
    modes: false,
    ease: 'smooth',
    params: [{ k: 'amount', label: 'Grow by %', kind: 'num', def: 18 }],
    gen: (a, r, d, E) => {
      const amt = (a.p?.amount ?? 18) / 100;
      return {
        scale: [[0, r.scale], [d / 2, r.scale * (1 + amt), E], [d, r.scale, E]]
      };
    }
  },
  Shake: {
    modes: false,
    ease: 'smooth',
    params: [{ k: 'amount', label: 'Distance', kind: 'num', def: 22 }],
    gen: (a, r, d, E) => {
      const amt = a.p?.amount ?? 22;
      return {
        x: [0, -1, 1, -0.7, 0.7, -0.35, 0].map((o, i, z) => [
          (d * i) / (z.length - 1),
          r.x + o * amt,
          E
        ])
      };
    }
  },
  Float: {
    modes: false,
    ease: 'smooth',
    params: [{ k: 'by', label: 'Distance', kind: 'num', def: 34 }],
    gen: (a, r, d, E) => {
      const by = a.p?.by ?? 34;
      return {
        y: [[0, r.y], [d / 2, r.y - by, E], [d, r.y, E]]
      };
    }
  },
  Heartbeat: {
    modes: false,
    ease: 'slowDown',
    params: [{ k: 'amount', label: 'Grow by %', kind: 'num', def: 25 }],
    gen: (a, r, d, E) => {
      const amt = (a.p?.amount ?? 25) / 100;
      return {
        scale: [
          [0, 1],
          [0.15, 1 + amt],
          [0.3, 1],
          [0.45, 1 + amt * 0.72],
          [0.7, 1]
        ].map(([f, m]) => [(d * f) / 0.7, r.scale * m, E])
      };
    }
  },
  Glow: {
    modes: false,
    ease: 'smooth',
    params: [{ k: 'amount', label: 'Glow size', kind: 'num', def: 46 }],
    gen: (a, r, d, E) => ({
      glow: [[0, r.glow || 0], [d / 2, a.p?.amount ?? 46, E], [d, r.glow || 0, E]]
    })
  }
};

export function rebuild(l: Layer) {
  if (l.type === 'group') return;
  l.tracks = {};
  const rest: Record<string, any> = {};
  PROPS.forEach(p => (rest[p] = (l as any)[p]));

  const anims = [...(l.anims || [])].sort((a, b) => a.start - b.start);

  anims.forEach(a => {
    const T = ANIMS[a.type];
    if (!T) return;
    const dur = a.dur || 1;
    const isModeIn = a.mode === 'in';
    const E = a.ease || T.ease || 'slowDown';

    const seg = (hiddenVal: number, shownVal: number) =>
      isModeIn
        ? [[0, hiddenVal], [dur, shownVal, E]]
        : [[0, shownVal], [dur, hiddenVal, E]];

    const spec = T.gen(a, rest, dur, E, isModeIn, seg);

    Object.entries(spec).forEach(([prop, trackData]) => {
      if (!Array.isArray(trackData)) return;
      if (!l.tracks[prop]) l.tracks[prop] = [];
      trackData.forEach(([relT, val, easeCurve]) => {
        const absT = a.start + relT;
        l.tracks[prop].push({
          t: absT,
          v: val,
          ease: easeCurve || E,
          ei: a.ei
        });
      });
    });
  });

  // Ensure keyframes in tracks are chronologically sorted and deduped
  Object.keys(l.tracks).forEach(p => {
    l.tracks[p].sort((a, b) => a.t - b.t);
  });
}
