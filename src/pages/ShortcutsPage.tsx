import React from 'react';
import { TopBar } from '../components/layout/TopBar';
import { Command, Keyboard, FileCode, CheckCircle, Sparkles } from 'lucide-react';

export const ShortcutsPage: React.FC = () => {
  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause playback' },
    { key: 'V', desc: 'Select / Move tool' },
    { key: 'H', desc: 'Hand / Pan tool (or hold Space)' },
    { key: 'R', desc: 'Add Rectangle' },
    { key: 'O', desc: 'Add Ellipse' },
    { key: 'S', desc: 'Add Star' },
    { key: 'T', desc: 'Add Text' },
    { key: 'Cmd / Ctrl + Z', desc: 'Undo' },
    { key: 'Cmd / Ctrl + Shift + Z', desc: 'Redo' },
    { key: 'Cmd / Ctrl + D', desc: 'Duplicate selected layer' },
    { key: 'Backspace / Del', desc: 'Delete selected layer' },
    { key: 'Cmd / Ctrl + 0', desc: 'Fit canvas to viewport' },
    { key: 'Cmd / Ctrl + 1', desc: 'Reset zoom to 100%' }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-200 flex flex-col">
      <TopBar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-acc/10 border border-acc/20 text-acc-light text-xs font-semibold mb-3">
            <Command className="w-3.5 h-3.5" />
            <span>Figtion Docs & Reference</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Documentation & Shortcuts
          </h1>
          <p className="text-gray-400 text-xs">
            Quick reference guide for keyboard navigation, workflow speed, and Figma integration.
          </p>
        </div>

        {/* Shortcuts Table */}
        <section className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-dark-border mb-4">
            <Keyboard className="w-5 h-5 text-acc" />
            <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {shortcuts.map((sc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-dark-card border border-dark-border/60"
              >
                <span className="text-gray-300">{sc.desc}</span>
                <kbd className="px-2 py-1 rounded bg-[#2c2e35] text-gray-200 font-mono text-[11px] border border-white/10 shadow-sm">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        {/* Figma Plugin Integration */}
        <section className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-4 border-b border-dark-border mb-4">
            <FileCode className="w-5 h-5 text-[#ff5c8a]" />
            <h2 className="text-base font-bold text-white">Figma Plugin Integration</h2>
          </div>

          <div className="space-y-4 text-xs text-gray-300 leading-relaxed">
            <p>
              Figtion includes a bundled Figma plugin in the <code className="bg-dark-card px-1.5 py-0.5 rounded text-acc-light">figma-plugin/</code> directory of this workspace.
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>In Figma, go to <b>Plugins &gt; Development &gt; Import plugin from manifest…</b> and select <code className="bg-dark-card px-1.5 py-0.5 rounded text-gray-200">figma-plugin/manifest.json</code>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>Select any Frame or vector graphic in Figma and click <b>Copy to Figtion</b>.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <span>Paste directly into Figtion or load via File &gt; Import. All layers, typography, vectors, and hierarchy are preserved!</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
