import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useEditor } from '../../context/EditorContext';
import { X, Copy, Check, Share2, Globe, Code } from 'lucide-react';

export const ShareModal: React.FC = () => {
  const { shareOpen, setShareOpen, project } = useEditor();
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://figtion.pages.dev';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog.Root open={shareOpen} onOpenChange={setShareOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-2xl z-50 text-gray-200 focus:outline-none">
          <div className="flex items-center justify-between pb-4 border-b border-dark-border">
            <Dialog.Title className="text-base font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#27a8ff]" />
              Share Project
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-mute hover:text-white p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="py-4 space-y-4 text-xs">
            <p className="text-gray-300">
              Share a link to <b>{project.title}</b> with your team, or embed it into your site.
            </p>

            <div>
              <label className="block text-mute font-semibold mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#27a8ff]" />
                Direct Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  type="text"
                  value={shareUrl}
                  className="flex-1 bg-dark-card border border-dark-border rounded-lg px-3 py-2 text-gray-300 text-xs font-mono outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-2 bg-dark-hover hover:bg-dark-border text-white rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-mute font-semibold mb-1.5 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-acc" />
                Embed Code
              </label>
              <textarea
                readOnly
                rows={2}
                value={`<iframe src="${shareUrl}" width="1280" height="720" frameborder="0" allowfullscreen></iframe>`}
                className="w-full bg-dark-card border border-dark-border rounded-lg p-2.5 text-gray-400 text-[11px] font-mono outline-none resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-dark-border">
            <button
              onClick={() => setShareOpen(false)}
              className="px-4 py-2 rounded-lg bg-acc hover:bg-acc-hover text-white font-semibold text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
