import React, { useState } from 'react';
import { useEditor } from '../../context/EditorContext';
import { BS_STYLES } from '../../engine/constants';
import { generateBrainstormVersions } from '../../engine/brainstorm';
import { Sparkles, X, Check, ArrowRight } from 'lucide-react';

export const BrainstormPanel: React.FC = () => {
  const { brainstormOpen, setBrainstormOpen, scene, setProject, setFi } = useEditor();
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set(['subtle', 'snappy']));
  const [isGenerating, setIsGenerating] = useState(false);

  if (!brainstormOpen) return null;

  const toggleStyle = (k: string) => {
    setSelectedStyles(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const { versions } = generateBrainstormVersions(scene, Array.from(selectedStyles));
      setProject(prev => ({
        ...prev,
        frames: [...prev.frames, ...versions]
      }));
      setIsGenerating(false);
      setBrainstormOpen(false);
      setFi(1); // Jump to first generated version
    }, 600);
  };

  return (
    <div className="fixed right-6 bottom-24 z-40 w-80 bg-dark-panel border border-dark-border rounded-2xl shadow-2xl p-5 text-gray-200 select-none animate-slide-up">
      <div className="flex items-center justify-between pb-3 border-b border-dark-border mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-acc/20 text-acc flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-sm text-white">Motion Brainstorm</span>
        </div>
        <button
          onClick={() => setBrainstormOpen(false)}
          className="text-mute hover:text-white p-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Select one or more motion moods to automatically generate animated variants of <b>{scene.name}</b>:
      </p>

      {/* Mood Options */}
      <div className="grid grid-cols-2 gap-1.5 mb-4">
        {BS_STYLES.map(([k, label]) => {
          const isSelected = selectedStyles.has(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggleStyle(k)}
              className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center justify-between ${
                isSelected
                  ? 'border-acc bg-acc/20 text-white font-semibold'
                  : 'border-dark-border bg-dark-card text-gray-400 hover:text-white'
              }`}
            >
              <span>{label.split(' ')[0]}</span>
              {isSelected && <Check className="w-3 h-3 text-acc" />}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleGenerate}
        disabled={selectedStyles.size === 0 || isGenerating}
        className="w-full py-2.5 px-4 rounded-xl bg-acc hover:bg-acc-hover disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-acc/30 transition-all"
      >
        <span>{isGenerating ? 'Generating…' : 'Generate Versions'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
