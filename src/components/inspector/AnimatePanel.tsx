import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ANIM_LABELS } from '../../engine/presets';
import { Section } from './ui';
import { Zap, X } from 'lucide-react';

interface PresetCardProps {
  label: string;
  type: string;
  onAdd: () => void;
}

// a dark preview tile that plays its animation on a loop (no hover needed)
const PresetPreviewCard: React.FC<PresetCardProps> = ({ label, type, onAdd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const t0 = performance.now();
    const S = 210;

    const loop = (now: number) => {
      const cycle = 2000;
      const e = Math.min(1, ((now - t0) % cycle) / 1300); // plays for 1.3s, rests 0.7s
      const k = 1 - Math.pow(1 - e, 3);
      ctx.fillStyle = '#2f323b';
      ctx.fillRect(0, 0, S, S);
      let alpha = 1, sc = 1, rot = 0, dx = 0, dy = 0;
      if (type === 'Fade') alpha = k;
      else if (type === 'Grow') { sc = 0.4 + 0.6 * k; alpha = k; }
      else if (type === 'Bounce') dy = -Math.abs(Math.sin(e * Math.PI * 3)) * 40 * (1 - e);
      else if (type === 'Spin') { rot = (1 - k) * Math.PI * 2; alpha = k; }
      else if (type === 'Slide') { dy = (1 - k) * 60; alpha = k; }
      else if (type === 'Pulse') sc = 1 + 0.22 * Math.sin(e * Math.PI * 2);
      else if (type === 'Wobble') rot = 0.25 * Math.sin(e * Math.PI * 4);
      else if (type === 'Shake') dx = Math.sin(e * Math.PI * 10) * 12;
      else if (type === 'Float') dy = -Math.sin(e * Math.PI) * 24;
      else if (type === 'Heartbeat') sc = 1 + 0.25 * Math.max(0, Math.sin(e * Math.PI * 4)) * (1 - e);
      else if (type === 'Glow') { ctx.shadowColor = '#c9b0fb'; ctx.shadowBlur = 30 * Math.sin(e * Math.PI); }
      ctx.save();
      ctx.translate(S / 2 + dx, S / 2 + dy);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = '#fff';
      ctx.font = '700 76px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Aa', 0, 4);
      ctx.restore();
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [type]);

  return (
    <div onClick={onAdd} className="group cursor-pointer text-center">
      <canvas ref={canvasRef} width={210} height={210} className="w-full aspect-square block rounded-[3px] bg-[#2f323b] group-hover:outline group-hover:outline-2 group-hover:outline-[var(--acc)]" />
      <div className="text-xs text-[var(--mute)] group-hover:text-[var(--ink)] mt-[6px] mb-[10px] truncate">{label}</div>
    </div>
  );
};

export const AnimatePanel: React.FC = () => {
  const { scene, sel, applyPreset, removeAnim } = useEditor();
  const [cat, setCat] = useState<'in' | 'out' | 'action'>('in');
  const layer = scene.layers.find(l => l.id === sel);

  if (!layer) {
    return <div className="pt-6 pb-8 text-center text-[var(--mute)] text-xs leading-relaxed">Select a layer to add animations.</div>;
  }

  const presets = [
    { label: 'Fade', type: 'Fade', mode: 'in' as const },
    { label: 'Slide', type: 'Slide', mode: 'in' as const },
    { label: 'Grow', type: 'Grow', mode: 'in' as const },
    { label: 'Bounce', type: 'Bounce', mode: 'in' as const },
    { label: 'Spin', type: 'Spin', mode: 'in' as const },
    { label: 'Pulse', type: 'Pulse', mode: 'action' as const },
    { label: 'Wobble', type: 'Wobble', mode: 'action' as const },
    { label: 'Shake', type: 'Shake', mode: 'action' as const },
    { label: 'Float', type: 'Float', mode: 'action' as const },
    { label: 'Heartbeat', type: 'Heartbeat', mode: 'action' as const },
    { label: 'Glow', type: 'Glow', mode: 'action' as const }
  ];
  const list = presets.filter(p => (cat === 'action' ? p.mode === 'action' : p.mode === 'in'));
  const seg = (on: boolean) => `flex-1 h-[34px] text-[13px] ${on ? 'bg-[#e3e4e9] text-[#111]' : 'text-[#777]'}`;

  return (
    <div className="pb-6 text-[13px]">
      <Section title="Animations" right={<span className="text-[var(--acc)] text-xs">{layer.anims?.length || 0}</span>}>
        {!layer.anims || layer.anims.length === 0 ? (
          <p className="text-[var(--mute)] text-xs pb-2">No animations yet — pick one below.</p>
        ) : (
          <div className="pb-2 space-y-[6px]">
            {layer.anims.map((anim, idx) => (
              <div key={anim.id ?? idx} className="flex items-center gap-2 bg-[#f4f4f6] rounded-md px-3 h-9">
                <Zap size={14} className="text-[var(--mute)]" />
                <span className="flex-1 truncate font-medium">{ANIM_LABELS[anim.type] || anim.type}</span>
                <span className="text-[var(--mute)] text-xs uppercase">{anim.mode || 'in'}</span>
                <span className="text-[var(--mute)] text-xs">{anim.dur}s</span>
                <button onClick={() => removeAnim(layer.id, idx)} title="Remove animation" className="text-[var(--mute)] hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="pt-[14px]">
        <div className="flex rounded-md overflow-hidden bg-[#f4f4f6] mb-3">
          <button className={seg(cat === 'in')} onClick={() => setCat('in')}>In</button>
          <button className={seg(cat === 'out')} onClick={() => setCat('out')}>Out</button>
          <button className={seg(cat === 'action')} onClick={() => setCat('action')}>Action</button>
        </div>
        <div className="text-[15px] font-semibold mb-[10px]">{cat === 'action' ? 'Emphasis' : 'Basic'}</div>
        <div className="grid grid-cols-2 gap-x-2">
          {list.map(p => (
            <PresetPreviewCard key={p.type} label={p.label} type={p.type} onAdd={() => applyPreset(layer.id, p.type, cat === 'out' ? 'out' : p.mode)} />
          ))}
        </div>
      </div>
    </div>
  );
};
