import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useEditor } from '../../context/EditorContext';
import { render, layerState } from '../../engine/renderer';
import { CANVAS_W, CANVAS_H } from '../../engine/constants';
import { boxSize } from '../../engine/textLayout';
import { Play } from 'lucide-react';

export const Stage: React.FC = () => {
  const {
    scene,
    t,
    sel,
    selSet,
    setSel,
    updateLayer,
    tool,
    setTool,
    zoom
  } = useEditor();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan and Zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingLayer, setIsDraggingLayer] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<number | null>(null);

  // Compute effective scale
  const [scale, setScale] = useState(1);

  const calculateFitScale = useCallback(() => {
    if (!containerRef.current) return 1;
    const { clientWidth, clientHeight } = containerRef.current;
    const pad = 80;
    const availW = clientWidth - pad;
    const availH = clientHeight - pad;
    return Math.min(availW / CANVAS_W, availH / CANVAS_H, 1);
  }, []);

  useEffect(() => {
    if (zoom === 'fit') {
      setScale(calculateFitScale());
    } else {
      setScale(zoom);
    }
  }, [zoom, calculateFitScale]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (zoom === 'fit') setScale(calculateFitScale());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoom, calculateFitScale]);

  // Redraw canvas on state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    render(ctx, scene, t, false, 1, 0, 0, selSet);
  }, [scene, t, selSet]);

  // Canvas Mouse Coordinates relative to 1280x720 canvas
  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle mouse or space held or tool === 'hand'
    if (e.button === 1 || tool === 'hand') {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;
    const { x, y } = getCanvasCoords(e);

    // Hit test layers in reverse order (top to bottom)
    const reversed = [...scene.layers].reverse();
    const hit = reversed.find(l => {
      if (l.hidden) return false;
      const s = layerState(l, t);
      const bx = boxSize(l, s);
      const hw = (bx.w * (s.scale ?? 1)) / 2;
      const hh = (bx.h * (s.scale ?? 1)) / 2;
      return x >= s.x - hw && x <= s.x + hw && y >= s.y - hh && y <= s.y + hh;
    });

    if (hit) {
      setSel(hit.id, e.shiftKey);
      setIsDraggingLayer(true);
      setDragStart({ x: x - hit.x, y: y - hit.y });
    } else {
      setSel(null);
      setEditingTextId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    if (isDraggingLayer && sel) {
      const { x, y } = getCanvasCoords(e);
      const newX = Math.round(x - dragStart.x);
      const newY = Math.round(y - dragStart.y);
      updateLayer(sel, { x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingLayer(false);
  };

  const handleDoubleClick = () => {
    if (sel) {
      const l = scene.layers.find(layer => layer.id === sel);
      if (l && l.type === 'text') {
        setEditingTextId(l.id);
      }
    }
  };

  const selectedLayer = scene.layers.find(l => l.id === editingTextId);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      className={`absolute inset-0 bg-[var(--pb)] overflow-hidden flex items-center justify-center select-none ${
        isPanning || tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Canvas Wrapper */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          width: CANVAS_W,
          height: CANVAS_H,
          boxShadow: '0 2px 14px #0002',
          outline: '2px solid #7a3ff2'
        }}
        className="relative bg-white rounded-[2px] shrink-0"
      >
        {/* frame label above the canvas, kept at a constant size whatever the zoom */}
        <div
          style={{ transform: `scale(${1 / scale})`, transformOrigin: 'left bottom', bottom: '100%', marginBottom: 6 / scale }}
          className="absolute left-0 flex items-center gap-[6px] text-[12px] text-[var(--acc)] whitespace-nowrap pointer-events-none"
        >
          <Play size={11} fill="currentColor" />
          <b className="font-medium max-w-[420px] truncate">{scene.name}</b>
          <span>· {scene.duration ? +scene.duration.toFixed(1) : 4}s</span>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block w-full h-full"
        />

        {/* In-place Text Editor Overlay */}
        {editingTextId && selectedLayer && selectedLayer.type === 'text' && (
          <textarea
            autoFocus
            value={selectedLayer.text}
            onChange={e => updateLayer(selectedLayer.id, { text: e.target.value })}
            onBlur={() => setEditingTextId(null)}
            onKeyDown={e => {
              if (e.key === 'Escape') setEditingTextId(null);
            }}
            style={{
              left: `${selectedLayer.x - selectedLayer.w / 2}px`,
              top: `${selectedLayer.y - selectedLayer.h / 2}px`,
              width: `${selectedLayer.w}px`,
              height: `${selectedLayer.h}px`,
              fontSize: `${selectedLayer.h}px`,
              fontFamily: selectedLayer.font || 'Inter',
              color: selectedLayer.fill,
              textAlign: selectedLayer.align || 'left'
            }}
            className="absolute bg-transparent outline-none border border-acc p-0 resize-none overflow-hidden leading-tight z-40"
          />
        )}
      </div>
    </div>
  );
};
