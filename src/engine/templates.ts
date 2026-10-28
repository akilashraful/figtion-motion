import { Project, Layer, Scene } from './types';
import { rebuild } from './presets';
import { BASEDEF } from './constants';

function createLayer(type: any, props: Partial<Layer>): Layer {
  const l: Layer = {
    id: Math.floor(Math.random() * 1000000),
    name: props.name || type,
    type,
    fill: props.fill || '#7a3ff2',
    fillOn: true,
    x: props.x || 640,
    y: props.y || 360,
    w: props.w || 200,
    h: props.h || 200,
    rot: props.rot || 0,
    scale: props.scale || 1,
    opacity: props.opacity ?? 1,
    tracks: {},
    anims: props.anims || [],
    ...BASEDEF,
    ...props
  };
  rebuild(l);
  return l;
}

export interface TemplateInfo {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: number;
  project: Project;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'kinetic-typography',
    title: 'Kinetic Typography Promo',
    category: 'Social Media',
    description: 'Dynamic cascading text animations with bouncy scale and slide accents.',
    duration: 4,
    project: {
      title: 'Kinetic Typography Promo',
      frames: [
        {
          id: 1,
          name: 'Main Slide',
          duration: 4,
          bg: '#0c0c0e',
          layers: [
            createLayer('rect', {
              name: 'Glow Backdrop',
              x: 640,
              y: 360,
              w: 500,
              h: 500,
              fill: '#7a3ff2',
              opacity: 0.15,
              cr: 250,
              anims: [
                { type: 'Grow', mode: 'in', start: 0, dur: 1.2, p: { from: 20 } },
                { type: 'Pulse', mode: 'action', start: 1.5, dur: 1.8, p: { amount: 30 } }
              ]
            }),
            createLayer('text', {
              name: 'Title Word 1',
              text: 'CREATE',
              font: 'Inter',
              weight: 800,
              h: 88,
              fill: '#ffffff',
              x: 640,
              y: 280,
              align: 'center',
              anims: [
                { type: 'Slide', mode: 'in', start: 0.2, dur: 0.8, p: { by: 120, dir: 'up' } },
                { type: 'Heartbeat', mode: 'action', start: 1.2, dur: 0.8, p: { amount: 15 } }
              ]
            }),
            createLayer('text', {
              name: 'Title Word 2',
              text: 'IN MOTION',
              font: 'Inter',
              weight: 800,
              h: 88,
              fill: '#c9b0fb',
              x: 640,
              y: 380,
              align: 'center',
              anims: [
                { type: 'Slide', mode: 'in', start: 0.45, dur: 0.8, p: { by: 120, dir: 'up' } },
                { type: 'Glow', mode: 'action', start: 1.6, dur: 1, p: { amount: 35 } }
              ]
            }),
            createLayer('text', {
              name: 'Subtitle',
              text: 'Turn static Figma graphics into lively animated experiences',
              font: 'Inter',
              weight: 500,
              h: 22,
              fill: '#8a8d98',
              x: 640,
              y: 470,
              align: 'center',
              anims: [
                { type: 'Fade', mode: 'in', start: 0.8, dur: 0.9, p: {} }
              ]
            }),
            createLayer('star', {
              name: 'Sparkle Left',
              x: 380,
              y: 260,
              w: 50,
              h: 50,
              fill: '#f5a524',
              points: 4,
              ir: 0.35,
              anims: [
                { type: 'Grow', mode: 'in', start: 0.6, dur: 0.6, p: { from: 0 } },
                { type: 'Rotate', mode: 'action', start: 1.2, dur: 2, p: { angle: 180 } }
              ]
            }),
            createLayer('star', {
              name: 'Sparkle Right',
              x: 900,
              y: 400,
              w: 60,
              h: 60,
              fill: '#ff5c8a',
              points: 4,
              ir: 0.35,
              anims: [
                { type: 'Grow', mode: 'in', start: 0.75, dur: 0.6, p: { from: 0 } },
                { type: 'Spin', mode: 'action', start: 1.4, dur: 2, p: { angle: 360 } }
              ]
            })
          ]
        }
      ]
    }
  },
  {
    id: 'product-feature',
    title: 'Product Feature Showcase',
    category: 'Marketing',
    description: 'Sleek rounded card pop with icon badges and floating indicators.',
    duration: 3.5,
    project: {
      title: 'Product Feature Showcase',
      frames: [
        {
          id: 1,
          name: 'Hero Frame',
          duration: 3.5,
          bg: '#16171b',
          layers: [
            createLayer('rect', {
              name: 'Card Container',
              x: 640,
              y: 360,
              w: 600,
              h: 360,
              fill: '#202228',
              stroke: '#30323a',
              strokeW: 2,
              cr: 24,
              shadow: 30,
              shOp: 0.3,
              anims: [
                { type: 'Grow', mode: 'in', start: 0, dur: 0.9, p: { from: 70 } }
              ]
            }),
            createLayer('ellipse', {
              name: 'Icon Badge',
              x: 430,
              y: 360,
              w: 110,
              h: 110,
              fill: '#7a3ff2',
              anims: [
                { type: 'Bounce', mode: 'in', start: 0.3, dur: 0.8, p: { by: 120 } }
              ]
            }),
            createLayer('text', {
              name: 'Feature Title',
              text: 'Real-time Canvas Rendering',
              font: 'Inter',
              weight: 700,
              h: 32,
              fill: '#ffffff',
              x: 520,
              y: 335,
              align: 'left',
              anims: [
                { type: 'Slide', mode: 'in', start: 0.5, dur: 0.7, p: { by: 60, dir: 'right' } }
              ]
            }),
            createLayer('text', {
              name: 'Feature Body',
              text: 'Ultra-fast 60 FPS animation previews with zero wait time.',
              font: 'Inter',
              weight: 400,
              h: 18,
              fill: '#9a9ca6',
              x: 520,
              y: 385,
              align: 'left',
              anims: [
                { type: 'Fade', mode: 'in', start: 0.7, dur: 0.7, p: {} }
              ]
            })
          ]
        }
      ]
    }
  },
  {
    id: 'holiday-sale',
    title: 'Holiday Special Offer',
    category: 'E-commerce',
    description: 'Festive sale banner with animated badge, countdown counter, and colorful accents.',
    duration: 4,
    project: {
      title: 'Holiday Special Offer',
      frames: [
        {
          id: 1,
          name: 'Promo 50% OFF',
          duration: 4,
          bg: '#0f172a',
          layers: [
            createLayer('rect', {
              name: 'Sale Tag',
              x: 640,
              y: 240,
              w: 220,
              h: 52,
              fill: '#ff5c8a',
              cr: 26,
              anims: [
                { type: 'Grow', mode: 'in', start: 0.1, dur: 0.6, p: { from: 20 } }
              ]
            }),
            createLayer('text', {
              name: 'Tag Label',
              text: 'LIMITED TIME',
              font: 'Inter',
              weight: 800,
              h: 18,
              fill: '#ffffff',
              x: 640,
              y: 240,
              align: 'center',
              anims: [
                { type: 'Fade', mode: 'in', start: 0.25, dur: 0.5, p: {} }
              ]
            }),
            createLayer('text', {
              name: 'Big Discount',
              text: '50% OFF',
              font: 'Inter',
              weight: 800,
              h: 110,
              fill: '#f5a524',
              x: 640,
              y: 350,
              align: 'center',
              anims: [
                { type: 'Bounce', mode: 'in', start: 0.4, dur: 0.9, p: { by: 200 } },
                { type: 'Pulse', mode: 'action', start: 1.6, dur: 1.2, p: { amount: 20 } }
              ]
            }),
            createLayer('text', {
              name: 'Call To Action',
              text: 'Shop new arrivals today · Free worldwide shipping',
              font: 'Inter',
              weight: 500,
              h: 22,
              fill: '#94a3b8',
              x: 640,
              y: 450,
              align: 'center',
              anims: [
                { type: 'Slide', mode: 'in', start: 0.8, dur: 0.8, p: { by: 50, dir: 'up' } }
              ]
            })
          ]
        }
      ]
    }
  }
];

export function getDefaultProject(): Project {
  return TEMPLATES[0].project;
}
