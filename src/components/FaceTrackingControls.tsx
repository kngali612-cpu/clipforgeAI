import React from 'react';
import {
  Users,
  UserCheck,
  SplitSquareVertical,
  CircleDot,
  Eye,
  Sliders,
  Scan,
  Maximize2,
  Sparkles,
  Camera
} from 'lucide-react';
import { FaceTrackingMode } from '../types';

interface FaceTrackingControlsProps {
  currentMode: FaceTrackingMode;
  onChangeMode: (mode: FaceTrackingMode) => void;
  showBoundingBoxes: boolean;
  onToggleBoundingBoxes: (show: boolean) => void;
  zoomLevel: number;
  onChangeZoomLevel: (zoom: number) => void;
  speakerFocus: 'auto' | 'host' | 'guest';
  onChangeSpeakerFocus: (focus: 'auto' | 'host' | 'guest') => void;
}

export const FaceTrackingControls: React.FC<FaceTrackingControlsProps> = ({
  currentMode,
  onChangeMode,
  showBoundingBoxes,
  onToggleBoundingBoxes,
  zoomLevel,
  onChangeZoomLevel,
  speakerFocus,
  onChangeSpeakerFocus
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold text-white">AI Face Tracking & Auto-Reframe</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleBoundingBoxes(!showBoundingBoxes)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showBoundingBoxes
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Face Landmarks: {showBoundingBoxes ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Reframe Layout Mode Grid */}
      <div>
        <span className="text-xs text-slate-400 font-medium block mb-2">
          Multi-Speaker Layout (OpusClip Auto-Reframe™):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            {
              id: 'auto-speaker',
              label: 'Auto Speaker Follow',
              desc: 'Crops & follows active face',
              icon: UserCheck
            },
            {
              id: 'split-screen',
              label: 'Dual Speaker Split',
              desc: 'Host top · Guest bottom',
              icon: SplitSquareVertical
            },
            {
              id: 'pip-bubble',
              label: 'Face Bubble (PiP)',
              desc: 'Content + circular face',
              icon: CircleDot
            },
            {
              id: 'blur-fill',
              label: 'Blur Background',
              desc: '16:9 with glass blur',
              icon: Maximize2
            }
          ].map((mode) => {
            const Icon = mode.icon;
            const isSelected = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onChangeMode(mode.id as FaceTrackingMode)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-500 shadow-lg shadow-purple-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-white">{mode.label}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{mode.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Controls: Speaker Focus and Zoom */}
      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Speaker Focus Selector */}
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">
            Active Camera Focus:
          </label>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'auto', label: 'AI Voice Activity' },
              { id: 'host', label: 'Lock Host' },
              { id: 'guest', label: 'Lock Guest' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => onChangeSpeakerFocus(f.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-colors border ${
                  speakerFocus === f.id
                    ? 'bg-slate-800 border-purple-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Slider */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Framing Zoom Level:</span>
            <span className="font-mono font-bold text-purple-400 tabular-nums">{(typeof zoomLevel === 'number' && !isNaN(zoomLevel) ? zoomLevel : 1.1).toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1.0}
              max={2.0}
              step={0.1}
              value={typeof zoomLevel === 'number' && !isNaN(zoomLevel) ? zoomLevel : 1.1}
              onChange={(e) => onChangeZoomLevel(parseFloat(e.target.value) || 1.1)}
              className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
