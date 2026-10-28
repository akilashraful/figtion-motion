import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { TopBar } from '../components/layout/TopBar';
import { TEMPLATES, TemplateInfo } from '../engine/templates';
import { useEditor } from '../context/EditorContext';
import { render } from '../engine/renderer';
import { Play, Sparkles, ArrowRight, Clock, Layers } from 'lucide-react';

const TemplateCard: React.FC<{ template: TemplateInfo }> = ({ template }) => {
  const navigate = useNavigate();
  const { loadTemplate } = useEditor();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let start = performance.now();
    const frame = template.project.frames[0];
    const duration = template.duration || 4;

    const tick = (now: number) => {
      const elapsed = ((now - start) / 1000) % duration;
      ctx.clearRect(0, 0, 320, 180);
      render(ctx, frame, elapsed, true, 320 / 1280, 0, 0);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [template]);

  const handleOpen = () => {
    loadTemplate(template.id);
    navigate('/');
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden shadow-xl hover:border-acc/60 transition-all hover:-translate-y-1 group flex flex-col">
      {/* Live Preview Canvas */}
      <div className="relative aspect-video bg-black/40 overflow-hidden cursor-pointer" onClick={handleOpen}>
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-acc text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
        </div>
        <div className="absolute top-3 left-3 bg-dark-panel/90 text-white text-[10px] font-semibold px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider">
          {template.category}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-acc-light transition-colors mb-1.5">
            {template.title}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-2 mb-4 leading-relaxed">
            {template.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-border/60">
          <div className="flex items-center gap-3 text-mute text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {template.duration}s
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {template.project.frames[0].layers.length} layers
            </span>
          </div>

          <button
            onClick={handleOpen}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-acc/15 hover:bg-acc text-acc-light hover:text-white font-semibold text-xs transition-all"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TemplatesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-200 flex flex-col">
      <TopBar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-acc/10 border border-acc/20 text-acc-light text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready-to-animate Motion Templates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Motion Graphics Gallery
          </h1>
          <p className="text-gray-400 text-sm">
            Kickstart your motion designs with pre-composed animated typography, social post cards, and feature promos.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map(tmpl => (
            <TemplateCard key={tmpl.id} template={tmpl} />
          ))}
        </div>
      </main>
    </div>
  );
};
