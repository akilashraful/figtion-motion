import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { Layer } from '../../engine/types';
import { Search, ArrowUp, ArrowDown, Eye, EyeOff, Copy, X } from 'lucide-react';
import { LayerIcon } from '../LayerIcon';

export const LayersPanel: React.FC = () => {
  const { scene, sel, selSet, setSel, updateLayer, removeLayer, duplicateLayer, reorderLayer } = useEditor();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameText, setRenameText] = useState('');

  const layers = scene.layers.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));

  const startRename = (l: Layer) => { setRenamingId(l.id); setRenameText(l.name); };
  const submitRename = () => {
    if (renamingId !== null && renameText.trim()) updateLayer(renamingId, { name: renameText.trim() });
    setRenamingId(null);
  };
  const act = 'px-1 text-[var(--mute)] hover:text-[var(--ink)]';

  return (
    <aside className="h-full w-full bg-white border-r border-[var(--line)] overflow-auto select-none">
      <div className="sticky top-0 bg-white z-10 border-b border-[var(--line)]">
        <div className="flex items-center justify-between px-[14px] h-[52px]">
          <span className="font-semibold">Layers</span>
          <button onClick={() => setShowSearch(s => !s)} className="text-[var(--mute)] hover:text-[var(--ink)] " title="Search layers"><Search size={16} /></button>
        </div>
        {showSearch && (
          <div className="px-[14px] pb-2">
            <input
              autoFocus
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 rounded-md bg-[#f4f4f6] px-[10px] outline-none"
            />
          </div>
        )}
      </div>

      {[...layers].reverse().map(l => {
        const on = selSet.has(l.id) || sel === l.id;
        return (
          <div
            key={l.id}
            onClick={e => setSel(l.id, e.shiftKey || e.metaKey || e.ctrlKey)}
            onDoubleClick={() => startRename(l)}
            className={`group flex items-center gap-2 px-[14px] py-[6px] cursor-pointer whitespace-nowrap ${on ? 'bg-[var(--accbg)]' : 'hover:bg-[#f6f6f8]'} ${l.hidden ? 'opacity-40' : ''}`}
          >
            <span className="w-4 text-center text-[var(--mute)]"><LayerIcon type={l.type} /></span>
            {renamingId === l.id ? (
              <input
                autoFocus
                value={renameText}
                onChange={e => setRenameText(e.target.value)}
                onBlur={submitRename}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                className="flex-1 border border-[var(--acc)] rounded px-1 outline-none bg-white"
              />
            ) : (
              <span className="flex-1 truncate">{l.name}</span>
            )}
            <span className="hidden group-hover:flex items-center">
              <button className={act} title="Move up" onClick={e => { e.stopPropagation(); reorderLayer(l.id, 'up'); }}><ArrowUp size={14} /></button>
              <button className={act} title="Move down" onClick={e => { e.stopPropagation(); reorderLayer(l.id, 'down'); }}><ArrowDown size={14} /></button>
              <button className={act} title={l.hidden ? 'Show' : 'Hide'} onClick={e => { e.stopPropagation(); updateLayer(l.id, { hidden: !l.hidden }); }}>{l.hidden ? <EyeOff size={14} /> : <Eye size={14} />}</button>
              <button className={act} title="Duplicate" onClick={e => { e.stopPropagation(); duplicateLayer(l.id); }}><Copy size={14} /></button>
              <button className={`${act} hover:!text-red-500`} title="Delete" onClick={e => { e.stopPropagation(); removeLayer(l.id); }}><X size={14} /></button>
            </span>
          </div>
        );
      })}
    </aside>
  );
};
