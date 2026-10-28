import { Project, Scene } from './types';
import { render } from './renderer';
import { CANVAS_W, CANVAS_H } from './constants';

export function exportProjectJSON(project: Project) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute('href', dataStr);
  dlAnchor.setAttribute('download', `${project.title || 'motion-lab'}.json`);
  dlAnchor.click();
}

export async function exportVideo(
  scene: Scene,
  fps: number = 30,
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const width = scene.w || CANVAS_W;
  const height = scene.h || CANVAS_H;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const duration = scene.duration || 4;
  const totalFrames = Math.ceil(duration * fps);
  const stream = canvas.captureStream(fps);

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : 'video/webm';

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };

    recorder.start();

    let frame = 0;
    const interval = 1000 / fps;

    function renderNext() {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }
      const time = frame / fps;
      render(ctx, scene, time, true, 1, 0, 0);
      frame++;
      if (onProgress) onProgress(Math.round((frame / totalFrames) * 100));
      setTimeout(renderNext, interval / 2); // capture cleanly
    }

    renderNext();
  });
}
