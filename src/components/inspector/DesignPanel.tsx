import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { FONTS } from '../../engine/constants';
import { Section, Row, Two, NumInput, SelectInput, ColorRow, Check } from './ui';
import { MoreHorizontal } from 'lucide-react';
import { LayerIcon } from '../LayerIcon';

export const DesignPanel: React.FC = () => {
  const { scene, sel, updateLayer, duplicateLayer, removeLayer } = useEditor();
  const [menu, setMenu] = useState(false);
  const layer = scene.layers.find(l => l.id === sel);

  if (!layer) {
    return <div className="pt-6 pb-8 text-center text-[var(--mute)] text-xs leading-relaxed">Select a layer on the stage or in the layers list to edit its design.</div>;
  }
  const set = (props: Record<string, any>) => updateLayer(layer.id, props);
  const isText = layer.type === 'text';

  return (
    <div className="pb-6 text-[13px]">
      {/* layer header */}
      <div className="flex items-center gap-[10px] pt-[6px] pb-[14px] relative">
        <span className="w-[18px] flex justify-center"><LayerIcon type={layer.type} size={16} /></span>
        <input
          value={layer.name}
          onChange={e => set({ name: e.target.value })}
          className="flex-1 border-0 font-semibold text-sm py-1 bg-transparent outline-none min-w-0"
        />
        <button onClick={() => setMenu(m => !m)} className="w-11 h-9 bg-[#f4f4f6] rounded-md flex items-center justify-center"><MoreHorizontal size={16} /></button>
        {menu && (
          <div className="absolute right-0 top-11 bg-white border border-[var(--line)] rounded-lg shadow-[0_8px_24px_#0002] z-10 min-w-[150px] overflow-hidden" onMouseLeave={() => setMenu(false)}>
            <div className="px-[14px] py-2 cursor-pointer hover:bg-[var(--accbg)]" onClick={() => { duplicateLayer(layer.id); setMenu(false); }}>Duplicate</div>
            <div className="px-[14px] py-2 cursor-pointer hover:bg-[var(--accbg)]" onClick={() => { removeLayer(layer.id); setMenu(false); }}>Delete</div>
          </div>
        )}
      </div>

      <Section title="Layout">
        <Row label="Position">
          <Two>
            <NumInput value={Math.round(layer.x)} onChange={v => set({ x: v })} />
            <NumInput value={Math.round(layer.y)} onChange={v => set({ y: v })} />
          </Two>
        </Row>
        <Row label="Size">
          <Two>
            <NumInput value={Math.round(layer.w)} min={1} onChange={v => set({ w: v })} />
            <NumInput value={Math.round(layer.h)} min={1} onChange={v => set({ h: v })} />
          </Two>
        </Row>
        <Row label="Angle"><NumInput value={Math.round((layer.rot || 0) * 10) / 10} onChange={v => set({ rot: v })} /></Row>
        {layer.type === 'rect' && <Row label="Corner radius"><NumInput value={layer.cr || 0} min={0} onChange={v => set({ cr: v })} /></Row>}
        {layer.type === 'star' && (
          <>
            <Row label="Points"><NumInput value={layer.points || 5} min={3} max={30} onChange={v => set({ points: Math.round(v) })} /></Row>
            <Row label="Inner radius %"><NumInput value={Math.round((layer.ir ?? 0.45) * 100)} min={10} max={95} onChange={v => set({ ir: v / 100 })} /></Row>
          </>
        )}
        {layer.type === 'polygon' && <Row label="Sides"><NumInput value={layer.sides || 6} min={3} max={40} onChange={v => set({ sides: Math.round(v) })} /></Row>}
      </Section>

      {isText && (
        <Section title="Text">
          <Row label="Font family">
            <SelectInput value={layer.font || 'Inter'} onChange={e => set({ font: e.target.value })}>
              {FONTS.map(([name]) => <option key={name} value={name}>{name}</option>)}
            </SelectInput>
          </Row>
          <Row label="Font weight">
            <SelectInput value={layer.weight || 700} onChange={e => set({ weight: Number(e.target.value) })}>
              {[[300, 'Light 300'], [400, 'Regular 400'], [500, 'Medium 500'], [600, 'Semi-bold 600'], [700, 'Bold 700'], [800, 'Extra-bold 800']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </SelectInput>
          </Row>
          <Row label="Size"><NumInput value={Math.round(layer.h)} min={4} onChange={v => set({ h: v })} /></Row>
          <Row label="Line height"><NumInput value={layer.lh ?? 120} min={50} onChange={v => set({ lh: v })} /></Row>
          <Row label="Letter spacing"><NumInput value={layer.ls ?? 0} onChange={v => set({ ls: v })} /></Row>
        </Section>
      )}

      <Section title="Opacity" right={<span className="flex items-center gap-1"><span className="w-24"><NumInput value={Math.round((layer.opacity ?? 1) * 100)} min={0} max={100} onChange={v => set({ opacity: v / 100 })} /></span><span>%</span></span>} />

      <Section title="Fill" right={<Check checked={layer.fillOn !== false} onChange={v => set({ fillOn: v })} />}>
        {layer.fillOn !== false && <ColorRow value={layer.fill} onChange={v => set({ fill: v })} />}
      </Section>

      <Section title="Stroke" right={<Check checked={(layer.strokeW || 0) > 0} onChange={v => set({ strokeW: v ? 4 : 0 })} />}>
        {(layer.strokeW || 0) > 0 && (
          <>
            <Row label="Width"><NumInput value={layer.strokeW || 0} min={0} onChange={v => set({ strokeW: v })} /></Row>
            <ColorRow value={layer.stroke || '#000000'} onChange={v => set({ stroke: v })} />
          </>
        )}
      </Section>

      <Section title="Shadow" right={<Check checked={(layer.shadow || 0) > 0} onChange={v => set(v ? { shadow: 24, shY: 14, shX: 0, shOp: layer.shOp ?? 0.35, shColor: layer.shColor || '#000000' } : { shadow: 0 })} />}>
        {(layer.shadow || 0) > 0 && (
          <>
            <Row label="Offset"><Two><NumInput value={layer.shX || 0} onChange={v => set({ shX: v })} /><NumInput value={layer.shY ?? 14} onChange={v => set({ shY: v })} /></Two></Row>
            <Row label="Blur"><NumInput value={layer.shadow || 0} min={0} onChange={v => set({ shadow: v })} /></Row>
          </>
        )}
      </Section>
    </div>
  );
};
