import { Project, Scene, Layer } from './types';
import { rebuild } from './presets';

export interface BrainstormState {
  status: 'inactive' | 'setup' | 'loading' | 'completed' | 'playing';
  srcId?: number;
  name?: string;
  versions: { frameId: number; label: string; style: string }[];
}

export function generateBrainstormVersions(
  frame: Scene,
  styles: string[]
): { versions: Scene[]; meta: { frameId: number; label: string; style: string }[] } {
  const resultScenes: Scene[] = [];
  const meta: { frameId: number; label: string; style: string }[] = [];

  const stylePresets: Record<string, { inAnim: string; inDur: number; actionAnim?: string }> = {
    subtle: { inAnim: 'Fade', inDur: 1.0 },
    snappy: { inAnim: 'Slide', inDur: 0.5 },
    playful: { inAnim: 'Bounce', inDur: 0.8, actionAnim: 'Wobble' },
    dramatic: { inAnim: 'Grow', inDur: 1.2, actionAnim: 'Pulse' },
    minimal: { inAnim: 'Fade', inDur: 0.6 }
  };

  styles.forEach((styleKey, idx) => {
    const config = stylePresets[styleKey] || stylePresets.subtle;
    const newFrameId = Date.now() + idx + 10;
    const label = `${styleKey.charAt(0).toUpperCase() + styleKey.slice(1)} Version`;

    const clonedLayers: Layer[] = frame.layers.map((l, lIdx) => {
      const cloned: Layer = JSON.parse(JSON.stringify(l));
      cloned.id = Math.floor(Math.random() * 1000000);
      cloned.anims = [];

      const delay = lIdx * 0.15;
      cloned.anims.push({
        type: config.inAnim,
        mode: 'in',
        start: delay,
        dur: config.inDur,
        p: { by: 120, dir: 'up', from: 40 }
      });

      if (config.actionAnim && lIdx === 0) {
        cloned.anims.push({
          type: config.actionAnim,
          mode: 'action',
          start: delay + config.inDur + 0.3,
          dur: 1.0,
          p: { amount: 20 }
        });
      }

      rebuild(cloned);
      return cloned;
    });

    const newScene: Scene = {
      ...JSON.parse(JSON.stringify(frame)),
      id: newFrameId,
      name: `${frame.name} · ${label}`,
      layers: clonedLayers
    };

    resultScenes.push(newScene);
    meta.push({
      frameId: newFrameId,
      label,
      style: styleKey
    });
  });

  return { versions: resultScenes, meta };
}
