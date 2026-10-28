export type LayerType = 'rect' | 'ellipse' | 'text' | 'image' | 'star' | 'polygon' | 'group' | 'path' | 'audio';

export interface Keyframe {
  t: number;
  v: any;
  ease?: string;
  ei?: number;
}

export interface AnimationSpec {
  id?: number;
  type: string;
  mode?: 'in' | 'out' | 'action';
  start: number;
  dur: number;
  p: Record<string, any>;
  ease?: string;
  ei?: number;
}

export interface LayerEffect {
  id: string;
  on?: boolean;
  p: Record<string, any>;
}

export interface Layer {
  id: number;
  name: string;
  type: LayerType;
  fill: string;
  fillOn?: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;
  scale: number;
  opacity: number;
  tracks: Record<string, Keyframe[]>;
  tag?: string;
  anims: AnimationSpec[];
  effects?: LayerEffect[];
  fxSeq?: any[];
  textFx?: any[];
  parent?: number | null;
  hidden?: boolean;
  locked?: boolean;
  expanded?: boolean;
  mask?: boolean;
  clipId?: number | null;
  crop?: [number, number, number, number];
  
  // Shape/Geometry
  cr?: number;
  ir?: number;
  points?: number;
  sides?: number;
  
  // Stroke & Effects
  stroke?: string;
  strokeW?: number;
  shadow?: number;
  shColor?: string;
  shOp?: number;
  shX?: number;
  shY?: number;
  blur?: number;
  glow?: number;
  glass?: number;
  bgBlur?: number;
  wig?: number;
  wigSpeed?: number;
  reveal?: number;
  revealDir?: string;
  maskAngle?: number;
  maskAx?: number;
  maskAy?: number;
  zoom?: number;
  cx?: number;
  cy?: number;
  num?: number;
  colT?: number;
  colorTo?: string;
  tsw?: number;
  blend?: string;

  // Text properties
  text?: string;
  font?: string;
  weight?: number;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  autoResize?: 'width' | 'height' | 'fixed';
  ls?: number;
  lh?: number;
  tcase?: 'none' | 'upper' | 'lower';
  kern?: boolean;
  liga?: boolean;
  bh?: number;
  swaps?: string[];
  counter?: { prefix?: string; suffix?: string; dec?: number };
  fvar?: any[];

  // Image & Path & Audio
  src?: string;
  pathData?: string;
  pointsList?: { x: number; y: number }[];
  audioVol?: number;
}

export interface Scene {
  id: number;
  name: string;
  duration: number;
  bg: string;
  w?: number;
  h?: number;
  layers: Layer[];
  comments?: CommentThread[];
}

export interface CommentThread {
  id: number;
  x: number;
  y: number;
  resolved?: boolean;
  author: string;
  text: string;
  createdAt: string;
  replies?: { author: string; text: string; createdAt: string }[];
}

export interface Project {
  title: string;
  frames: Scene[];
}

export type ActiveTool = 'select' | 'hand' | 'frame' | 'rect' | 'ellipse' | 'star' | 'polygon' | 'text' | 'image' | 'pen' | 'audio' | 'comment' | 'brainstorm';
