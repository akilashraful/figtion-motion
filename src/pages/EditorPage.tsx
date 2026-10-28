import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';

// The editor itself is the full editor build (every feature and the original design), hosted
// edge-to-edge in an iframe so its styles, keyboard shortcuts and clipboard handling stay isolated
// from the React shell (routing, PWA, Templates / Presets / Docs pages).
export const EditorPage: React.FC = () => {
  const frame = useRef<HTMLIFrameElement>(null);
  // ?f=<id> reopens a file the editor autosaved in this browser; no id = a blank file
  const [params] = useSearchParams();
  const fileId = useRef(params.get('f')).current;
  // a fresh query on every visit, so the editor page is never served from a stale cache
  const src = useRef(`/legacy-editor.html?${fileId ? `f=${encodeURIComponent(fileId)}&` : ''}v=${Date.now()}`).current;
  // the editor sets the tab title to "<file name> · Figtion"; put the site title back when leaving it
  useEffect(() => {
    const prev = document.title;
    return () => { document.title = prev; };
  }, []);
  return (
    <iframe
      ref={frame}
      title="Figtion editor"
      src={src}
      onLoad={() => frame.current?.contentWindow?.focus()}
      allow="clipboard-read; clipboard-write; local-fonts; fullscreen"
      className="fixed inset-0 w-full h-full border-0 bg-white"
    />
  );
};
