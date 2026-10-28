import React, { useRef, useState, useEffect } from 'react';
import { useEditor } from '../../context/EditorContext';
import { ANIM_LABELS } from '../../engine/presets';
import { Pause, Play, Repeat, Zap } from 'lucide-react';

const NAME_W = 240;

// the original light timeline: names on the left, grey animation bars, lavender selected row, red playhead
export const Timeline: React.FC = () => {
  const { scene, t, setT, playing, togglePlay, loop, setLoop, sel, selSet, setSel } = useEditor();
  const laneRef = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);

  const duration = scene.duration || 4;
  const pps = 140;
  const width = Math.max(duration * pps + 120, 800);

  const seek = (clientX: number) => {
    if (!laneRef.current) return;
    const r = laneRef.current.getBoundingClientRect();
    setT(Math.max(0, Math.min(duration, (clientX - r.left) / pps)));
  };

  useEffect(() => {
    if (!scrubbing) return;
    const move = (e: MouseEvent) => seek(e.clientX);
    const up = () => setScrubbing(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [togglePlay]);

  const layers = [...scene.layers].reverse();
  const phLeft = t * pps;

  return (
    <footer className="h-full w-full bg-white border-t border-[var(--line)] overflow-auto relative select-none">
      <div style={{ width: NAME_W + width }} className="relative min-h-full bg-[#f9f9fa]">
        {/* ruler row */}
        <div className="flex sticky top-0 z-[5] bg-white h-11">
          <div style={{ width: NAME_W }} className="sticky left-0 z-[6] bg-white flex items-center gap-[6px] px-[14px] shrink-0">
            <button onClick={togglePlay} className={`w-7 h-7 rounded-md text-[15px] hover:bg-[#f0f0f3] ${playing ? 'text-[var(--acc)]' : ''}`} title="Play / pause (Space)">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
            <button onClick={() => setLoop(!loop)} className={`w-7 h-7 rounded-md text-[15px] hover:bg-[#f0f0f3] ${loop ? 'text-[var(--acc)]' : ''}`} title="Loop"><Repeat size={16} /></button>
          </div>
          <div
            ref={laneRef}
            onMouseDown={e => { setScrubbing(true); seek(e.clientX); }}
            style={{ width }}
            className="relative h-11 cursor-pointer shrink-0"
          >
            {Array.from({ length: Math.ceil(duration) + 1 }).map((_, i) => (
              <div key={i} style={{ left: i * pps }} className="absolute top-6 text-[10px] text-[var(--mute)] -translate-x-1/2">{i}s</div>
            ))}
            <div style={{ left: phLeft }} className="absolute top-2 bg-[#f2385a] text-white font-bold text-[11px] px-[10px] py-[3px] rounded-xl -translate-x-1/2 pointer-events-none">{t.toFixed(2)}</div>
          </div>
        </div>

        {/* layer rows */}
        {layers.map(l => {
          const on = selSet.has(l.id) || sel === l.id;
          return (
            <div key={l.id} onClick={() => setSel(l.id)} className="flex h-[34px]">
              <div
                style={{ width: NAME_W }}
                className={`sticky left-0 z-[4] shrink-0 flex items-center gap-2 px-[14px] whitespace-nowrap overflow-hidden cursor-pointer ${on ? 'bg-[var(--accbg)]' : 'bg-white'}`}
              >
                <Zap size={14} className="text-[var(--mute)] shrink-0" />
                <span className="truncate">{l.name}</span>
                {(l.anims || []).length > 0 && <span className="text-[var(--mute)] truncate">· {ANIM_LABELS[l.anims[0].type] || l.anims[0].type}</span>}
              </div>
              <div style={{ width }} className={`relative shrink-0 ${on ? 'bg-[#ebe6f9]' : ''}`}>
                {(l.anims || []).map((a, i) => (
                  <div
                    key={i}
                    title={`${ANIM_LABELS[a.type] || a.type} · ${a.dur}s`}
                    style={{ left: (a.start || 0) * pps, width: Math.max(16, (a.dur || 1) * pps) }}
                    className={`absolute top-[5px] h-6 rounded-[7px] cursor-grab ${on ? 'bg-[#bdaef3]' : 'bg-[#d1d0d6]'}`}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* playhead line */}
        <div style={{ left: NAME_W + phLeft }} className="absolute top-11 bottom-0 w-[2px] -ml-px bg-[#f2385a] z-[3] pointer-events-none" />
      </div>
    </footer>
  );
};
