import React from 'react';
import { useEditor } from '../../context/EditorContext';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Download, CircleDot, ChevronDown, ArrowBigUp } from 'lucide-react';

// the original top bar: logo, centred file title, zoom, Share and a full-height Export block
export const TopBar: React.FC = () => {
  const { project, setProject, zoom, setZoom, setExportOpen, setShareOpen } = useEditor();

  const zoomLabel = zoom === 'fit' ? 'Fit' : `${Math.round(zoom * 100)}%`;
  const item = 'px-3 py-1.5 rounded cursor-pointer outline-none hover:bg-[var(--accbg)] flex justify-between gap-6 text-[13px]';

  return (
    <header className="h-12 bg-[#0c0c0e] text-white flex items-center pl-[14px] gap-3 select-none">
      <div className="w-[226px] leading-none"><CircleDot size={20} /></div>

      <div className="flex-1 flex justify-center">
        <input
          type="text"
          value={project.title}
          onChange={e => setProject(prev => ({ ...prev, title: e.target.value }))}
          className="bg-transparent border-0 text-white font-semibold text-[15px] text-center w-[200px] outline-none"
        />
      </div>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="bg-transparent border-0 text-white font-semibold text-sm flex items-center gap-1 outline-none">
            <span>{zoomLabel}</span>
            <ChevronDown size={14} className="opacity-60" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="min-w-[140px] bg-white text-[var(--ink)] border border-[var(--line)] rounded-lg p-1 shadow-[0_8px_24px_#0002] z-50" sideOffset={6} align="end">
            <DropdownMenu.Item onClick={() => setZoom('fit')} className={item}><span>Fit</span><span className="text-[var(--mute)] text-[11px] flex items-center"><ArrowBigUp size={12} />1</span></DropdownMenu.Item>
            {[0.25, 0.5, 0.75, 1, 1.5, 2].map(z => (
              <DropdownMenu.Item key={z} onClick={() => setZoom(z)} className={item}><span>{Math.round(z * 100)}%</span></DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <button onClick={() => setShareOpen(true)} className="px-4 py-2 font-semibold text-white bg-[#27a8ff] hover:brightness-95">
        Share
      </button>

      <button onClick={() => setExportOpen(true)} className="h-12 px-6 -ml-1 flex items-center gap-2 font-semibold text-white bg-[var(--acc)] hover:brightness-95">
        <Download size={16} strokeWidth={1.75} />
        <span>Export</span>
      </button>
    </header>
  );
};
