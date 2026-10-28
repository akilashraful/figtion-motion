import React, { useRef, useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Square, Circle, Star, Hexagon, Type, Image as ImageIcon, Sparkles, ChevronUp } from 'lucide-react';

const SHAPES = [
  { id: 'rect', name: 'Rectangle', key: 'R', Icon: Square, props: { w: 180, h: 180, fill: '#7a3ff2' } },
  { id: 'ellipse', name: 'Ellipse', key: 'O', Icon: Circle, props: { w: 180, h: 180, fill: '#ff5c8a' } },
  { id: 'star', name: 'Star', key: '', Icon: Star, props: { w: 160, h: 160, fill: '#f5a524', points: 5 } },
  { id: 'polygon', name: 'Polygon', key: '', Icon: Hexagon, props: { w: 180, h: 180, fill: '#27a8ff', sides: 6 } }
] as const;

const Tip: React.FC<{ label: string; k?: string; children: React.ReactNode }> = ({ label, k, children }) => (
  <Tooltip.Root>
    <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content sideOffset={10} className="bg-[#16171b] text-[#f2f2f5] text-xs rounded-lg px-2 py-1.5 flex items-center gap-2 shadow-[0_4px_16px_#0006] z-50">
        {label}
        {k ? <kbd className="font-semibold text-[11px] bg-[#2c2e35] text-[#bdbec8] rounded px-1.5 py-[3px] font-sans">{k}</kbd> : null}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);

// the original floating pill: insert tools, then AI brainstorm
export const Toolbar: React.FC = () => {
  const { addLayer, setBrainstormOpen } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shape, setShape] = useState<(typeof SHAPES)[number]>(SHAPES[0]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => addLayer('image', { name: file.name.replace(/\.[^/.]+$/, ''), src: ev.target?.result as string, w: 300, h: 200 });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const btn = 'tb w-[34px] h-[34px] rounded-[9px] grid place-items-center text-[#e9e9ee] hover:bg-[#2c2e35] outline-none relative';
  const sep = <div className="w-px h-5 bg-[#33353d] mx-1" />;

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-[#16171b] rounded-[14px] p-1 flex items-center shadow-[0_8px_28px_#0006,0_0_0_1px_#ffffff12]">
        <Tip label="Add a text layer" k="T">
          <button className={btn} onClick={() => addLayer('text', { text: 'New Text', h: 48, fill: '#111111', weight: 700 })}><Type className="w-[18px] h-[18px]" /></button>
        </Tip>

        <div className="flex items-center">
          <Tip label={`Add a ${shape.name.toLowerCase()} layer`} k={shape.key}>
            <button className={btn} onClick={() => addLayer(shape.id as any, { ...shape.props })}><shape.Icon className="w-[18px] h-[18px]" /></button>
          </Tip>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="w-[14px] h-[34px] -ml-1 rounded-md grid place-items-center text-[#9a9ba6] hover:bg-[#2c2e35] outline-none"><ChevronUp className="w-3 h-3" /></button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="top" align="start" sideOffset={14} className="min-w-[220px] bg-[#16171b] text-[#e9e9ee] rounded-xl p-[5px] shadow-[0_8px_28px_#0007,0_0_0_1px_#ffffff14] z-50">
                {SHAPES.map(s => (
                  <DropdownMenu.Item
                    key={s.id}
                    onClick={() => { setShape(s); addLayer(s.id as any, { ...s.props }); }}
                    className="h-[34px] flex items-center gap-[10px] px-[10px] rounded-lg text-[13px] cursor-pointer outline-none data-[highlighted]:bg-[#2c2e35]"
                  >
                    <s.Icon className="w-[18px] h-[18px] text-[#cfcfd8]" />
                    <span className="flex-1">{s.name}</span>
                    {s.key ? <kbd className="font-semibold text-[11px] bg-[#2c2e35] text-[#bdbec8] rounded px-1.5 py-[3px] font-sans">{s.key}</kbd> : null}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <Tip label="Add an image layer">
          <button className={btn} onClick={() => fileInputRef.current?.click()}><ImageIcon className="w-[18px] h-[18px]" /></button>
        </Tip>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

        {sep}

        <Tip label="AI Brainstorm" k="B">
          <button className={btn} onClick={() => setBrainstormOpen(true)}><Sparkles className="w-[18px] h-[18px]" /></button>
        </Tip>
      </div>
    </Tooltip.Provider>
  );
};
