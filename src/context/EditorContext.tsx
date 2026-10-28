import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Project, Scene, Layer, ActiveTool } from '../engine/types';
import { getDefaultProject, TEMPLATES } from '../engine/templates';
import { rebuild } from '../engine/presets';
import { BASEDEF } from '../engine/constants';

interface EditorContextType {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  fi: number;
  setFi: (i: number) => void;
  scene: Scene;
  sel: number | null;
  selSet: Set<number>;
  setSel: (id: number | null, multi?: boolean) => void;
  selectedLayers: Layer[];
  t: number;
  setT: (t: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  togglePlay: () => void;
  loop: boolean;
  setLoop: (l: boolean) => void;
  tool: ActiveTool;
  setTool: (t: ActiveTool) => void;
  zoom: number | 'fit';
  setZoom: (z: number | 'fit') => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  addLayer: (type: any, props?: Partial<Layer>) => Layer;
  updateLayer: (id: number, props: Partial<Layer>) => void;
  removeLayer: (id: number) => void;
  duplicateLayer: (id: number) => void;
  reorderLayer: (id: number, dir: 'up' | 'down') => void;
  applyPreset: (layerId: number, type: string, mode?: 'in' | 'out' | 'action', params?: any) => void;
  removeAnim: (layerId: number, animIndex: number) => void;
  loadTemplate: (templateId: string) => void;
  exportOpen: boolean;
  setExportOpen: (o: boolean) => void;
  shareOpen: boolean;
  setShareOpen: (o: boolean) => void;
  shortcutsOpen: boolean;
  setShortcutsOpen: (o: boolean) => void;
  brainstormOpen: boolean;
  setBrainstormOpen: (o: boolean) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(getDefaultProject());
  const [fi, setFi] = useState<number>(0);
  const [sel, setSelState] = useState<number | null>(null);
  const [selSet, setSelSet] = useState<Set<number>>(new Set());
  const [t, setT] = useState<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(true);
  const [tool, setTool] = useState<ActiveTool>('select');
  const [zoom, setZoom] = useState<number | 'fit'>('fit');

  // Modals
  const [exportOpen, setExportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [brainstormOpen, setBrainstormOpen] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<Project[]>([getDefaultProject()]);
  const [histIndex, setHistIndex] = useState<number>(0);

  const scene = project.frames[fi] || project.frames[0];

  const pushHistory = useCallback((newProj: Project) => {
    setHistory(prev => {
      const sliced = prev.slice(0, histIndex + 1);
      return [...sliced, JSON.parse(JSON.stringify(newProj))];
    });
    setHistIndex(prev => prev + 1);
  }, [histIndex]);

  const undo = useCallback(() => {
    if (histIndex > 0) {
      const prevProj = history[histIndex - 1];
      setHistIndex(histIndex - 1);
      setProject(JSON.parse(JSON.stringify(prevProj)));
    }
  }, [histIndex, history]);

  const redo = useCallback(() => {
    if (histIndex < history.length - 1) {
      const nextProj = history[histIndex + 1];
      setHistIndex(histIndex + 1);
      setProject(JSON.parse(JSON.stringify(nextProj)));
    }
  }, [histIndex, history]);

  const canUndo = histIndex > 0;
  const canRedo = histIndex < history.length - 1;

  const setSel = useCallback((id: number | null, multi: boolean = false) => {
    setSelState(id);
    if (id === null) {
      setSelSet(new Set());
    } else if (multi) {
      setSelSet(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    } else {
      setSelSet(new Set([id]));
    }
  }, []);

  const selectedLayers = scene.layers.filter(l => selSet.has(l.id));

  // Animation playback tick
  const lastTimeRef = useRef<number>(performance.now());
  useEffect(() => {
    let animId: number;
    const tick = (now: number) => {
      if (playing) {
        const dt = (now - lastTimeRef.current) / 1000;
        setT(curT => {
          let next = curT + dt;
          if (next >= scene.duration) {
            if (loop) next = 0;
            else {
              setPlaying(false);
              return scene.duration;
            }
          }
          return next;
        });
      }
      lastTimeRef.current = now;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [playing, loop, scene.duration]);

  const togglePlay = useCallback(() => {
    setPlaying(p => {
      if (!p && t >= scene.duration) setT(0);
      return !p;
    });
  }, [t, scene.duration]);

  const addLayer = useCallback((type: any, props?: Partial<Layer>): Layer => {
    const newLayer: Layer = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: props?.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${scene.layers.length + 1}`,
      type,
      fill: props?.fill || '#7a3ff2',
      fillOn: true,
      x: props?.x || (scene.w ? scene.w / 2 : 640),
      y: props?.y || (scene.h ? scene.h / 2 : 360),
      w: props?.w || (type === 'text' ? 240 : 160),
      h: props?.h || (type === 'text' ? 48 : 160),
      rot: 0,
      scale: 1,
      opacity: 1,
      tracks: {},
      anims: [],
      ...BASEDEF,
      ...props
    };
    if (type === 'text' && !props?.text) {
      newLayer.text = 'Double click to edit';
    }
    rebuild(newLayer);

    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      curScene.layers = [...curScene.layers, newLayer];
      nextProj.frames[fi] = curScene;
      pushHistory(nextProj);
      return nextProj;
    });

    setSel(newLayer.id);
    return newLayer;
  }, [scene, fi, pushHistory, setSel]);

  const updateLayer = useCallback((id: number, props: Partial<Layer>) => {
    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      curScene.layers = curScene.layers.map(l => {
        if (l.id === id) {
          const updated = { ...l, ...props };
          rebuild(updated);
          return updated;
        }
        return l;
      });
      nextProj.frames[fi] = curScene;
      return nextProj;
    });
  }, [fi]);

  const removeLayer = useCallback((id: number) => {
    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      curScene.layers = curScene.layers.filter(l => l.id !== id);
      nextProj.frames[fi] = curScene;
      pushHistory(nextProj);
      return nextProj;
    });
    setSel(null);
  }, [fi, pushHistory, setSel]);

  const duplicateLayer = useCallback((id: number) => {
    const target = scene.layers.find(l => l.id === id);
    if (!target) return;
    const cloned: Layer = JSON.parse(JSON.stringify(target));
    cloned.id = Date.now() + Math.floor(Math.random() * 1000);
    cloned.name = `${target.name} copy`;
    cloned.x += 24;
    cloned.y += 24;
    rebuild(cloned);

    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      curScene.layers = [...curScene.layers, cloned];
      nextProj.frames[fi] = curScene;
      pushHistory(nextProj);
      return nextProj;
    });
    setSel(cloned.id);
  }, [scene.layers, fi, pushHistory, setSel]);

  const reorderLayer = useCallback((id: number, dir: 'up' | 'down') => {
    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      const idx = curScene.layers.findIndex(l => l.id === id);
      if (idx === -1) return prev;
      const targetIdx = dir === 'up' ? idx + 1 : idx - 1;
      if (targetIdx < 0 || targetIdx >= curScene.layers.length) return prev;

      const layers = [...curScene.layers];
      const [item] = layers.splice(idx, 1);
      layers.splice(targetIdx, 0, item);
      curScene.layers = layers;
      nextProj.frames[fi] = curScene;
      return nextProj;
    });
  }, [fi]);

  const applyPreset = useCallback((layerId: number, type: string, mode: 'in' | 'out' | 'action' = 'in', params: any = {}) => {
    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      curScene.layers = curScene.layers.map(l => {
        if (l.id === layerId) {
          const updated = { ...l };
          const newAnim = {
            id: Date.now(),
            type,
            mode,
            start: t,
            dur: 0.8,
            p: params
          };
          updated.anims = [...(updated.anims || []), newAnim];
          rebuild(updated);
          return updated;
        }
        return l;
      });
      nextProj.frames[fi] = curScene;
      pushHistory(nextProj);
      return nextProj;
    });
  }, [fi, t, pushHistory]);

  const removeAnim = useCallback((layerId: number, animIndex: number) => {
    setProject(prev => {
      const nextProj = { ...prev };
      const curScene = { ...nextProj.frames[fi] };
      curScene.layers = curScene.layers.map(l => {
        if (l.id === layerId) {
          const updated = { ...l };
          const anims = [...(updated.anims || [])];
          anims.splice(animIndex, 1);
          updated.anims = anims;
          rebuild(updated);
          return updated;
        }
        return l;
      });
      nextProj.frames[fi] = curScene;
      pushHistory(nextProj);
      return nextProj;
    });
  }, [fi, pushHistory]);

  const loadTemplate = useCallback((templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      const cloned = JSON.parse(JSON.stringify(tmpl.project));
      cloned.frames.forEach((f: Scene) => {
        f.layers.forEach((l: Layer) => rebuild(l));
      });
      try { sessionStorage.setItem('figtion:load', JSON.stringify({ title: cloned.title, frames: cloned.frames })); } catch (e) { /* ignore */ }
      setProject(cloned);
      setFi(0);
      setT(0);
      setSel(null);
      pushHistory(cloned);
    }
  }, [pushHistory, setSel]);

  return (
    <EditorContext.Provider
      value={{
        project,
        setProject,
        fi,
        setFi,
        scene,
        sel,
        selSet,
        setSel,
        selectedLayers,
        t,
        setT,
        playing,
        setPlaying,
        togglePlay,
        loop,
        setLoop,
        tool,
        setTool,
        zoom,
        setZoom,
        undo,
        redo,
        canUndo,
        canRedo,
        addLayer,
        updateLayer,
        removeLayer,
        duplicateLayer,
        reorderLayer,
        applyPreset,
        removeAnim,
        loadTemplate,
        exportOpen,
        setExportOpen,
        shareOpen,
        setShareOpen,
        shortcutsOpen,
        setShortcutsOpen,
        brainstormOpen,
        setBrainstormOpen
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be used within EditorProvider');
  return ctx;
};
