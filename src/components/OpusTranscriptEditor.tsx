import React, { useState } from 'react';
import { FileText, Sparkles, Scissors, Clock, Volume2 } from 'lucide-react';
import { Clip, WordTimestamp } from '../types';

interface OpusTranscriptEditorProps {
  clip: Clip;
  currentTime: number;
  onSeekWord: (time: number) => void;
  onUpdateWords?: (words: WordTimestamp[]) => void;
}

export const OpusTranscriptEditor: React.FC<OpusTranscriptEditorProps> = ({
  clip,
  currentTime,
  onSeekWord,
  onUpdateWords
}) => {
  const [removeFillers, setRemoveFillers] = useState(false);
  const [editingWordIdx, setEditingWordIdx] = useState<number | null>(null);

  const words = clip.words || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Interactive Word Timeline & Transcript</h3>
        </div>
        <button
          onClick={() => setRemoveFillers(!removeFillers)}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            removeFillers
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Detect and remove filler pauses (um, uh)"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Remove Filler Words: {removeFillers ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Words Container */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 max-h-48 overflow-y-auto">
        <div className="flex flex-wrap gap-1.5 items-center leading-relaxed">
          {words.filter((w): w is WordTimestamp => Boolean(w && typeof w === 'object')).map((w, idx) => {
            const clipStart = typeof clip.startTime === 'number' && !isNaN(clip.startTime) ? clip.startTime : 0;
            const startSec = typeof w.start === 'number' && !isNaN(w.start) ? w.start : clipStart;
            const endSec = typeof w.end === 'number' && !isNaN(w.end) ? w.end : (startSec + 0.4);
            const isCurrent = currentTime >= startSec && currentTime <= endSec;
            const isPast = currentTime > endSec;
            const isFiller = Boolean(w.isFiller && removeFillers);

            if (isFiller) {
              return (
                <span
                  key={idx}
                  className="text-xs text-rose-500 line-through opacity-40 px-1 select-none font-mono"
                  title="Cut by AI Filler Removal"
                >
                  {w.word || ''}
                </span>
              );
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSeekWord(startSec)}
                className={`group relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-purple-600 text-white font-bold scale-105 shadow-md shadow-purple-600/30'
                    : isPast
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{w.word || ''}</span>
                {w.emoji && (
                  <span className="text-sm select-none">{w.emoji}</span>
                )}
                <span className="hidden group-hover:block absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/90 text-[9px] font-mono text-slate-300 whitespace-nowrap z-20">
                  {startSec.toFixed(1)}s
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Hint */}
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Click any word to jump video playback to that exact instant.</span>
        <span className="text-emerald-400 font-medium">Smart AI Word Alignment Active</span>
      </div>
    </div>
  );
};
