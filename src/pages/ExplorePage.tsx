import React, { useState, useRef, useEffect } from 'react';
import { TopBar } from '../components/layout/TopBar';
import * as Slider from '@radix-ui/react-slider';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { ease } from '../engine/easing';

export const ExplorePage: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'Fade' | 'Slide' | 'Grow' | 'Bounce' | 'Spin' | 'Pulse' | 'Wobble' | 'Heartbeat'>('Bounce');
  const [selectedEase, setSelectedEase] = useState<string>('bounceP');
  const [duration, setDuration] = useState<number>(1.2);
  const [intensity, setIntensity] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let start = performance.now();

    const loop = (now: number) => {
      const elapsedSec = (now - start) / 1000;
      const cycle = elapsedSec % (duration + 0.6); // repeat loop with slight pause
      const u = Math.min(1, cycle / duration);
      const e = ease(selectedEase, intensity, u);

      ctx.clearRect(0, 0, 500, 340);

      // Background preview box
      ctx.fillStyle = '#16171b';
      ctx.fillRect(0, 0, 500, 340);

      // Center object
      ctx.save();
      ctx.translate(250, 170);

      let alpha = 1;
      let sc = 1;
      let rot = 0;
      let dy = 0;
      let dx = 0;

      if (selectedPreset === 'Fade') {
        alpha = e;
      } else if (selectedPreset === 'Slide') {
        dy = (1 - e) * -120;
        alpha = e;
      } else if (selectedPreset === 'Grow') {
        sc = e;
      } else if (selectedPreset === 'Bounce') {
        dy = (1 - e) * -140;
      } else if (selectedPreset === 'Spin') {
        rot = e * Math.PI * 2;
      } else if (selectedPreset === 'Pulse') {
        sc = 1 + 0.3 * Math.sin(u * Math.PI * 2);
      } else if (selectedPreset === 'Wobble') {
        rot = 0.25 * Math.sin(u * Math.PI * 4);
      } else if (selectedPreset === 'Heartbeat') {
        sc = 1 + 0.35 * Math.sin(u * Math.PI);
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.rotate(rot);
      ctx.scale(sc, sc);

      // Draw stylized card
      ctx.fillStyle = '#7a3ff2';
      ctx.shadowColor = 'rgba(122, 63, 242, 0.4)';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-55, -55 + dy, 110, 110, 24);
      else ctx.fillRect(-55, -55 + dy, 110, 110);
      ctx.fill();

      // Card icon
      ctx.fillStyle = '#ffffff';
      // lucide circle-dot, drawn as strokes
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, dy, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, dy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();

      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animId);
  }, [selectedPreset, selectedEase, duration, intensity, isPlaying]);

  const presets = ['Fade', 'Slide', 'Grow', 'Bounce', 'Spin', 'Pulse', 'Wobble', 'Heartbeat'] as const;
  const easings = [
    ['smooth', 'Smooth Curve'],
    ['natural', 'Natural Cubic'],
    ['slowDown', 'Decelerate (Slow Down)'],
    ['accelerate', 'Accelerate (Ease In)'],
    ['elastic', 'Elastic Spring'],
    ['bounceP', 'Realistic Bounce']
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-200 flex flex-col">
      <TopBar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-acc/10 border border-acc/20 text-acc-light text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Motion Physics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Preset & Easing Playground
          </h1>
          <p className="text-gray-400 text-xs">
            Fine-tune motion dynamics, spring curves, and duration parameters in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Canvas Display */}
          <div className="lg:col-span-7 bg-dark-card border border-dark-border rounded-2xl p-4 shadow-xl flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={500}
              height={340}
              className="w-full max-w-[500px] aspect-[500/340] rounded-xl bg-[#16171b] border border-white/5"
            />
            <div className="w-full flex items-center justify-between mt-4 px-2">
              <span className="text-xs text-mute font-mono">
                Duration: {duration}s · Intensity: {intensity}%
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-acc hover:bg-acc-hover text-white text-xs font-semibold transition-colors"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-5 bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl space-y-6 text-xs">
            {/* Presets */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Preset Motion</label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPreset(p)}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition-all ${
                      selectedPreset === p
                        ? 'border-acc bg-acc/20 text-white font-semibold'
                        : 'border-dark-border bg-dark-card text-mute hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Easing Curves */}
            <div>
              <label className="block text-gray-300 font-semibold mb-2">Easing Function</label>
              <div className="space-y-1.5">
                {easings.map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setSelectedEase(k)}
                    className={`w-full py-2 px-3 rounded-lg border text-left font-medium transition-all flex items-center justify-between ${
                      selectedEase === k
                        ? 'border-acc bg-acc/20 text-white font-semibold'
                        : 'border-dark-border bg-dark-card text-mute hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    <span className="font-mono text-[10px] opacity-60">{k}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider (Radix UI) */}
            <div>
              <div className="flex justify-between font-semibold mb-2 text-gray-300">
                <span>Animation Duration</span>
                <span className="font-mono text-acc">{duration}s</span>
              </div>
              <Slider.Root
                value={[duration]}
                onValueChange={([val]) => setDuration(val)}
                min={0.2}
                max={3.0}
                step={0.1}
                className="relative flex items-center select-none touch-none w-full h-5"
              >
                <Slider.Track className="bg-dark-card relative grow rounded-full h-1.5">
                  <Slider.Range className="absolute bg-acc rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-acc" />
              </Slider.Root>
            </div>

            {/* Intensity Slider (Radix UI) */}
            <div>
              <div className="flex justify-between font-semibold mb-2 text-gray-300">
                <span>Curve Intensity</span>
                <span className="font-mono text-acc">{intensity}%</span>
              </div>
              <Slider.Root
                value={[intensity]}
                onValueChange={([val]) => setIntensity(val)}
                min={10}
                max={100}
                step={5}
                className="relative flex items-center select-none touch-none w-full h-5"
              >
                <Slider.Track className="bg-dark-card relative grow rounded-full h-1.5">
                  <Slider.Range className="absolute bg-acc rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-acc" />
              </Slider.Root>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
