import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useEditor } from '../../context/EditorContext';
import { exportVideo, exportProjectJSON } from '../../engine/exportEngine';
import { X, Download, Film, FileJson, CheckCircle2 } from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { exportOpen, setExportOpen, scene, project } = useEditor();
  const [format, setFormat] = useState<'webm' | 'json'>('webm');
  const [fps, setFps] = useState<number>(30);
  const [progress, setProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [done, setDone] = useState<boolean>(false);

  const handleExport = async () => {
    if (format === 'json') {
      exportProjectJSON(project);
      setExportOpen(false);
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setDone(false);

    try {
      const blob = await exportVideo(scene, fps, pct => setProgress(pct));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title || 'animation'}.webm`;
      a.click();
      setDone(true);
    } catch (err) {
      alert('Error during export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog.Root open={exportOpen} onOpenChange={setExportOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-2xl z-50 text-gray-200 focus:outline-none">
          <div className="flex items-center justify-between pb-4 border-b border-dark-border">
            <Dialog.Title className="text-base font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-acc" />
              Export Animation
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-mute hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="py-4 space-y-4 text-xs">
            {/* Format selection */}
            <div>
              <label className="block text-gray-400 font-semibold mb-2">Export Format</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('webm')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    format === 'webm'
                      ? 'border-acc bg-acc/20 text-white font-semibold'
                      : 'border-dark-border bg-dark-card text-gray-400 hover:text-white'
                  }`}
                >
                  <Film className="w-5 h-5 text-acc" />
                  <span>Video (WebM / MP4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    format === 'json'
                      ? 'border-acc bg-acc/20 text-white font-semibold'
                      : 'border-dark-border bg-dark-card text-gray-400 hover:text-white'
                  }`}
                >
                  <FileJson className="w-5 h-5 text-acc-light" />
                  <span>Project (JSON)</span>
                </button>
              </div>
            </div>

            {/* Frame rate for video */}
            {format === 'webm' && (
              <div>
                <label className="block text-gray-400 font-semibold mb-2">Frame Rate</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFps(30)}
                    className={`py-2 rounded-lg border text-center font-medium transition-all ${
                      fps === 30
                        ? 'border-acc bg-acc/20 text-white'
                        : 'border-dark-border bg-dark-card text-mute hover:text-white'
                    }`}
                  >
                    30 FPS (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFps(60)}
                    className={`py-2 rounded-lg border text-center font-medium transition-all ${
                      fps === 60
                        ? 'border-acc bg-acc/20 text-white'
                        : 'border-dark-border bg-dark-card text-mute hover:text-white'
                    }`}
                  >
                    60 FPS (Ultra Smooth)
                  </button>
                </div>
              </div>
            )}

            {/* Progress bar during export */}
            {isExporting && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Rendering canvas frames…</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-dark-card rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-acc transition-all duration-150"
                  />
                </div>
              </div>
            )}

            {done && (
              <div className="flex items-center gap-2 text-green-400 bg-green-950/40 border border-green-800/40 p-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-xs">Export completed! Download started automatically.</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-dark-border">
            <button
              onClick={() => setExportOpen(false)}
              className="px-4 py-2 rounded-lg bg-dark-card hover:bg-dark-hover text-gray-300 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-acc hover:bg-acc-hover text-white font-semibold text-xs shadow-md shadow-acc/30 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting…' : 'Start Export'}</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
