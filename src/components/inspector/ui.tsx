import React, { useRef } from 'react';
import { Grip } from 'lucide-react';

// ---- building blocks shared by the Design and Animate panels (the original panel look) ----

export const Section: React.FC<{ title: string; right?: React.ReactNode; children?: React.ReactNode }> = ({ title, right, children }) => (
  <div className="border-b border-[var(--line)] -mx-4 px-4 pt-[14px] pb-2">
    <div className="flex items-center justify-between font-semibold text-sm mb-[10px] min-h-[22px]">
      <span>{title}</span>
      {right}
    </div>
    {children}
  </div>
);

export const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[84px_1fr] gap-2 items-center mb-2">
    <label className="text-[var(--mute)]">{label}</label>
    {children}
  </div>
);

export const Two: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="flex gap-[6px]">{children}</div>;

const SCRUB = <Grip size={13} strokeWidth={1.75} />;

// a number field with a drag icon: drag sideways to change the value (Shift x10, Alt x0.1)
export const NumInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}> = ({ value, onChange, min = -Infinity, max = Infinity, step = 1, className = '' }) => {
  const latest = useRef({ value, onChange });
  latest.current = { value, onChange };

  const startScrub = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const x0 = e.clientX;
    const v0 = latest.current.value;
    document.body.style.cursor = 'ew-resize';
    const move = (ev: PointerEvent) => {
      const mult = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1;
      const dec = Math.max(0, Math.min(4, Math.ceil(-Math.log10(step * mult))));
      let v = v0 + ((ev.clientX - x0) / 2) * step * mult;
      v = Math.max(min, Math.min(max, v));
      latest.current.onChange(+v.toFixed(dec));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      document.body.style.cursor = '';
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <span className={`relative block min-w-0 flex-1 ${className}`}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min === -Infinity ? undefined : min}
        max={max === Infinity ? undefined : max}
        step={step}
        onChange={e => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        className="w-full h-[34px] rounded-md bg-[#f4f4f6] border-0 pl-[22px] pr-1 outline-none focus:ring-1 focus:ring-[var(--acc)]"
      />
      <i
        onPointerDown={startScrub}
        title="Drag to change"
        className="absolute left-[5px] top-1/2 -translate-y-1/2 grid place-items-center w-[14px] h-[22px] text-[var(--mute)] hover:text-[var(--acc)] cursor-ew-resize touch-none not-italic select-none"
      >
        {SCRUB}
      </i>
    </span>
  );
};

export const SelectInput: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', ...rest }) => (
  <select {...rest} className={`w-full h-[34px] rounded-md bg-[#f4f4f6] border-0 px-[10px] outline-none ${className}`} />
);

export const ColorRow: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const hex = (value || '#000000').replace('#', '').toUpperCase();
  return (
    <Row label="Color">
      <Two>
        <input
          key={hex}
          defaultValue={hex}
          maxLength={6}
          onChange={e => {
            const v = e.target.value.replace(/[^0-9a-f]/gi, '');
            if (v.length === 6) onChange('#' + v);
          }}
          className="flex-1 h-[34px] rounded-md bg-[#f4f4f6] border-0 px-[10px] uppercase outline-none"
        />
        <input
          type="color"
          value={value && value.length === 7 ? value : '#000000'}
          onChange={e => onChange(e.target.value)}
          className="w-[44px] h-[34px] rounded-md border border-[var(--line)] p-[3px] bg-white cursor-pointer"
        />
      </Two>
    </Row>
  );
};

export const Check: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-[#7a3ff2] cursor-pointer" />
);
