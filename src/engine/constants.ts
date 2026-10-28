export const CANVAS_W = 1280;
export const CANVAS_H = 720;

export const PROPS = [
  'x','y','w','h','rot','scale','opacity','blur','glow','shadow','reveal',
  'strokeW','zoom','cx','cy','num','bgBlur','glass','colT','ls','lh','cr','ir','tsw'
] as const;

export const TPROPS = ['x','y','w','h','rot','scale','opacity'] as const;
export const FPROPS = ['blur','glow','shadow','reveal'] as const;

export const FXDEF = {
  glass: 0,
  colT: 0,
  cr: 0,
  ir: 0.45,
  tsw: 0,
  colorTo: '#ff5c8a',
  points: 5,
  zoom: 1,
  cx: 0,
  cy: 0,
  num: 0,
  maskAngle: 0,
  maskAx: 0,
  maskAy: 0,
  reveal: 1,
  revealDir: 'left',
  blur: 0,
  glow: 0,
  shadow: 0,
  blend: 'source-over',
  strokeW: 0,
  stroke: '#111111',
  shColor: '#000000',
  shOp: 0.5,
  shX: 0,
  shY: 14,
  wig: 0,
  wigSpeed: 6,
  bgBlur: 0
};

export const TXDEF = {
  fillOn: true,
  font: 'system-ui',
  weight: 700,
  italic: false,
  align: 'left' as const,
  valign: 'top' as const,
  autoResize: 'width' as const,
  ls: 0,
  lh: 120,
  tcase: 'none' as const,
  kern: true,
  liga: true,
  bh: 150
};

export const BASEDEF = { ...FXDEF, ...TXDEF };

export const DIRS: Record<string, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
};

export const ANCHORS: Record<string, [number, number]> = {
  center: [0, 0],
  top: [0, -1],
  bottom: [0, 1],
  left: [-1, 0],
  right: [1, 0],
  'top left': [-1, -1],
  'top right': [1, -1],
  'bottom left': [-1, 1],
  'bottom right': [1, 1]
};

export const ANCHOR_OPTS: [string, string][] = Object.keys(ANCHORS).map(k => [
  k,
  k[0].toUpperCase() + k.slice(1)
]);

export const BS_STYLES: [string, string][] = [
  ['subtle', 'Subtle & Smooth'],
  ['snappy', 'Snappy & Crisp'],
  ['playful', 'Playful & Bouncy'],
  ['dramatic', 'Dramatic & Cinematic'],
  ['minimal', 'Minimal & Modern'],
  ['expressive', 'Expressive & Wild']
];

export const FONTS: [string, string][] = [
  ['Inter', 'Inter, sans-serif'],
  ['system-ui', 'system-ui, sans-serif'],
  ['Space Grotesk', '"Space Grotesk", sans-serif'],
  ['Playfair Display', '"Playfair Display", serif'],
  ['JetBrains Mono', '"JetBrains Mono", monospace'],
  ['Helvetica', 'Helvetica, Arial, sans-serif'],
  ['Arial', 'Arial, sans-serif'],
  ['Georgia', 'Georgia, serif'],
  ['Courier New', '"Courier New", monospace']
];
