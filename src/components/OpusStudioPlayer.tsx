import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Copy,
  Check,
  Smartphone,
  Square,
  Monitor,
  Flame,
  Type,
  Share2,
  Scan,
  Sparkles,
  Sliders,
  Scissors
} from 'lucide-react';
import { Clip, VideoProject, AspectRatioType, CaptionPresetType, FaceTrackingMode } from '../types';
import { formatTime, generateSrtContent, generateVttContent, downloadSingleFile } from '../utils/exportUtils';
import { FaceTrackingControls } from './FaceTrackingControls';
import { OpusTranscriptEditor } from './OpusTranscriptEditor';

interface OpusStudioPlayerProps {
  clip: Clip | null;
  project: VideoProject | null;
  onSelectNextClip?: () => void;
  onSelectPrevClip?: () => void;
}

export const OpusStudioPlayer: React.FC<OpusStudioPlayerProps> = ({
  clip,
  project,
  onSelectNextClip,
  onSelectPrevClip
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [captionPreset, setCaptionPreset] = useState<CaptionPresetType>('hormozi');
  const [faceTrackingMode, setFaceTrackingMode] = useState<FaceTrackingMode>('auto-speaker');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [faceZoomLevel, setFaceZoomLevel] = useState<number>(1.2);
  const [speakerFocus, setSpeakerFocus] = useState<'auto' | 'host' | 'guest'>('auto');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isRenderingExport, setIsRenderingExport] = useState(false);

  useEffect(() => {
    if (clip) {
      setAspectRatio(clip.aspectRatio || '9:16');
      if (videoRef.current) {
        videoRef.current.currentTime = clip.startTime;
        setCurrentTime(clip.startTime);
      }
    }
  }, [clip?.id]);

  if (!clip) {
    return (
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
        Select a clip from the matrix to inspect in the OpusClip Studio.
      </div>
    );
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= clip.endTime || videoRef.current.currentTime < clip.startTime) {
        videoRef.current.currentTime = clip.startTime;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    if (cur >= clip.endTime) {
      videoRef.current.currentTime = clip.startTime;
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleCopyCaption = (platform: 'tiktok' | 'instagram' | 'x') => {
    const text = clip.socialCopy[platform] || clip.socialCopy.tiktok;
    navigator.clipboard.writeText(text);
    setCopiedType(platform);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadSrt = () => {
    const srt = generateSrtContent(clip);
    downloadSingleFile(`${clip.id}_subtitles.srt`, srt, 'text/plain');
  };

  const handleDownloadVtt = () => {
    const vtt = generateVttContent(clip);
    downloadSingleFile(`${clip.id}_subtitles.vtt`, vtt, 'text/vtt');
  };

  // Video Export package simulation
  const handleExportFullClip = () => {
    setIsRenderingExport(true);
    setTimeout(() => {
      setIsRenderingExport(false);
      const srt = generateSrtContent(clip);
      downloadSingleFile(`${clip.id}_opusclip_4k_ready.srt`, srt, 'text/plain');
    }, 1200);
  };

  // Determine current spoken words & animated highlights
  const clipRelativeTime = currentTime - clip.startTime;
  const words = clip.words || [];
  const currentWordIndex = words.findIndex((w) => currentTime >= w.start && currentTime <= w.end);
  const activeWord = currentWordIndex !== -1 ? words[currentWordIndex] : words[Math.floor(clipRelativeTime * 2.8) % (words.length || 1)];

  return (
    <section id="studio" className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Studio Top Info Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-bold text-purple-400">OpusClip Rank #{clip.index}</span>
            <span>·</span>
            <span>{clip.duration}s length</span>
            <span>·</span>
            <span className="font-mono">{formatTime(clip.startTime)} → {formatTime(clip.endTime)}</span>
            <span>·</span>
            <span className="text-emerald-400 font-medium">Free Unlimited 4K</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {clip.title}
          </h2>
        </div>

        {/* OpusClip Virality Score Bar */}
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-3 shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400"
                  strokeDasharray={`${clip.viralityScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-mono font-black text-white text-sm">
                {clip.viralityScore}
              </span>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>ClipGenius Score</span>
              </div>
              <div className="text-xs font-semibold text-emerald-400">High Virality Potential</div>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:grid grid-cols-3 gap-3 text-[11px] text-slate-400">
            <div>
              <span className="block text-[10px] text-slate-500">Hook</span>
              <span className="font-mono font-bold text-white">{clip.metrics?.hookScore ?? Math.min(99, (clip.viralityScore || 85) + 1)}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Flow</span>
              <span className="font-mono font-bold text-white">{clip.metrics?.flowScore ?? Math.max(70, (clip.viralityScore || 85) - 2)}%</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-500">Engagement</span>
              <span className="font-mono font-bold text-white">{clip.metrics?.engagementScore ?? (clip.viralityScore || 85)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Phone Canvas Player (6 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* 9:16 Phone Bezel */}
          <div
            className={`relative bg-slate-950 rounded-[32px] overflow-hidden shadow-2xl border-4 border-slate-800 flex items-center justify-center transition-all duration-300 ${
              aspectRatio === '9:16'
                ? 'w-[310px] sm:w-[350px] h-[600px] sm:h-[660px]'
                : aspectRatio === '1:1'
                ? 'w-[360px] sm:w-[420px] h-[360px] sm:h-[420px]'
                : 'w-full max-w-[560px] h-[315px]'
            }`}
          >
            {/* Top Hook Headline Banner */}
            <div className="absolute top-4 inset-x-4 z-20 pointer-events-none text-center">
              <span className="inline-block px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-tight rounded-md shadow-lg font-mono">
                {clip.hookHeadline || 'WATCH THIS UNTIL THE END'}
              </span>
            </div>

            {/* Video Canvas Layers based on Face Tracking Mode */}
            {faceTrackingMode === 'split-screen' && aspectRatio === '9:16' ? (
              /* Dual Speaker Split Screen Layout */
              <div className="w-full h-full flex flex-col">
                {/* Top Half: Speaker 1 (Host) */}
                <div className="relative flex-1 bg-slate-900 overflow-hidden border-b-2 border-purple-500">
                  <img
                    src="/src/assets/images/opus_host_face_1793534904244.jpg"
                    alt="Host Speaker"
                    className="w-full h-full object-cover scale-110"
                  />
                  {showBoundingBoxes && (
                    <div className="absolute inset-8 border border-purple-400/80 rounded-lg pointer-events-none">
                      <span className="absolute -top-4 left-1 px-1 bg-purple-600 text-[9px] text-white font-mono rounded">
                        Host (99.2%)
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Host Speaking</span>
                  </div>
                </div>

                {/* Bottom Half: Speaker 2 (Guest) */}
                <div className="relative flex-1 bg-slate-900 overflow-hidden">
                  <img
                    src="/src/assets/images/opus_guest_face_1793534920593.jpg"
                    alt="Guest Speaker"
                    className="w-full h-full object-cover scale-110"
                  />
                  {showBoundingBoxes && (
                    <div className="absolute inset-8 border border-slate-400/60 rounded-lg pointer-events-none">
                      <span className="absolute -top-4 left-1 px-1 bg-slate-700 text-[9px] text-white font-mono rounded">
                        Guest (98.6%)
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[9px] text-slate-300 font-mono">
                    Guest Cam
                  </div>
                </div>
              </div>
            ) : faceTrackingMode === 'blur-fill' && aspectRatio === '9:16' ? (
              /* Cinematic Blur Fill Layout */
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                <video
                  src={project?.sourceStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-50"
                  muted
                  playsInline
                  loop
                />
                <div className="relative z-10 w-full aspect-video shadow-2xl rounded-xl overflow-hidden border border-slate-700">
                  <video
                    ref={videoRef}
                    src={project?.sourceStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                    className="w-full h-full object-cover"
                    playsInline
                    loop
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                    onClick={handlePlayPause}
                  />
                </div>
              </div>
            ) : (
              /* Auto Speaker Follow (Single Pan-and-Scan Face Tracking) */
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={project?.sourceStreamUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{
                    transform: `scale(${faceZoomLevel})`
                  }}
                  playsInline
                  loop
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  onClick={handlePlayPause}
                />

                {/* Animated Face Tracking Bounding Box */}
                {showBoundingBoxes && (
                  <div className="absolute inset-x-12 inset-y-24 border-2 border-purple-500 rounded-2xl pointer-events-none transition-all">
                    <div className="absolute -top-5 left-2 px-2 py-0.5 bg-purple-600 rounded text-[10px] text-white font-mono font-bold flex items-center gap-1.5 shadow-md">
                      <Scan className="w-3 h-3" />
                      <span>Active Face: 99.4% [Centering]</span>
                    </div>

                    {/* Eye and mouth crosshairs */}
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-1/4 right-1/4 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-6 h-1 bg-emerald-400/80 rounded-full" />
                  </div>
                )}

                {/* Picture-in-Picture Face Bubble */}
                {faceTrackingMode === 'pip-bubble' && (
                  <div className="absolute bottom-28 right-4 w-28 h-28 rounded-full border-2 border-purple-500 overflow-hidden shadow-2xl z-20">
                    <img
                      src="/src/assets/images/opus_host_face_1793534904244.jpg"
                      alt="Face Bubble"
                      className="w-full h-full object-cover scale-125"
                    />
                    <div className="absolute bottom-1 inset-x-0 text-center text-[8px] bg-black/70 text-purple-300 font-mono">
                      Host
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Animated Karaoke Subtitles with Emojis */}
            <div
              className={`absolute inset-x-4 pointer-events-none text-center px-2 py-2 z-20 transition-all ${
                aspectRatio === '9:16' ? 'bottom-20' : 'bottom-10'
              }`}
            >
              <div
                className={`inline-block px-4 py-2.5 rounded-2xl transition-all ${
                  captionPreset === 'hormozi'
                    ? 'bg-black/85 shadow-2xl border border-yellow-400/30'
                    : captionPreset === 'mrbeast'
                    ? 'bg-black/90 border-2 border-rose-500'
                    : captionPreset === 'cyber'
                    ? 'bg-black/90 border border-cyan-400 shadow-cyan-500/20 shadow-lg'
                    : 'bg-black/75 backdrop-blur-md'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {words.slice(0, 6).map((w, idx) => {
                    const isWordActive = w.word === activeWord?.word;
                    let styleClass = 'text-white';
                    if (isWordActive) {
                      if (captionPreset === 'hormozi') styleClass = 'text-yellow-400 scale-110 font-black';
                      else if (captionPreset === 'mrbeast') styleClass = 'text-rose-400 scale-110 font-black';
                      else if (captionPreset === 'cyber') styleClass = 'text-cyan-300 scale-110 font-black';
                      else styleClass = 'text-purple-300 font-black scale-105';
                    }
                    return (
                      <span
                        key={idx}
                        className={`text-base sm:text-lg uppercase tracking-tight font-black transition-all ${styleClass}`}
                      >
                        {w.word}
                        {w.emoji && isWordActive && (
                          <span className="ml-1 text-xl select-none inline-block animate-bounce">{w.emoji}</span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Play Overlay Button */}
            {!isPlaying && (
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer z-30"
                aria-label="Play video"
              >
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </button>
            )}

            {/* Live Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-20">
              <div
                className="bg-purple-500 h-full transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, ((currentTime - clip.startTime) / (clip.duration || 1)) * 100)
                  )}%`
                }}
              />
            </div>
          </div>

          {/* Quick Player Bar */}
          <div className="w-full max-w-[350px] mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-slate-300">
            <button
              onClick={handlePlayPause}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => handleSeek(clip.startTime)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min={clip.startTime}
              max={clip.endTime}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {formatTime(currentTime - clip.startTime)}
            </span>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right Column: OpusClip Controls, Face Tracking, Transcript & Export (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Face Tracking & Multi-Speaker Auto-Reframe (The Core Requested Feature) */}
          <FaceTrackingControls
            currentMode={faceTrackingMode}
            onChangeMode={setFaceTrackingMode}
            showBoundingBoxes={showBoundingBoxes}
            onToggleBoundingBoxes={setShowBoundingBoxes}
            zoomLevel={faceZoomLevel}
            onChangeZoomLevel={setFaceZoomLevel}
            speakerFocus={speakerFocus}
            onChangeSpeakerFocus={setSpeakerFocus}
          />

          {/* 2. Interactive Transcript & Filler Word Cutter */}
          <OpusTranscriptEditor
            clip={clip}
            currentTime={currentTime}
            onSeekWord={handleSeek}
          />

          {/* 3. "Why This Clip Will Go Viral" (OpusClip Explainability Breakdown) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>OpusClip AI Virality Breakdown</span>
              </h3>
              <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                Score {clip.viralityScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {clip.viralityReason}
            </p>
          </div>

          {/* 4. Caption Style Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-purple-400" />
              <span>Creator Caption Presets</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'hormozi', label: 'Hormozi Pop', sample: 'Yellow Highlight' },
                { id: 'mrbeast', label: 'MrBeast', sample: 'Red & White' },
                { id: 'aliabdaal', label: 'Clean Minimal', sample: 'Editorial Sans' },
                { id: 'cyber', label: 'Cyber Neon', sample: 'Cyan Glow' }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCaptionPreset(style.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    captionPreset === style.id
                      ? 'bg-purple-950 border-purple-500 ring-1 ring-purple-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{style.label}</div>
                  <div className="text-[10px] text-slate-400">{style.sample}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. 1-Click "Take It & Paste It Directly" Machine */}
          <div className="bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-900 border-2 border-red-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500 fill-current" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  1-Click YouTube Shorts Direct Paste
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase font-mono">
                Click-Optimized
              </span>
            </div>

            {/* Master 1-Click Copy Everything Button */}
            <button
              onClick={() => {
                const text = `${clip.clickPack?.shortTitle || clip.title}\n\n${clip.clickPack?.description || clip.captionSummary}\n\n${clip.tags?.join(' ') || '#shorts #viral'}\n\nPINNED COMMENT:\n${clip.clickPack?.pinnedComment || 'Drop your thoughts below! 👇'}`;
                navigator.clipboard.writeText(text);
                setCopiedType('master');
                setTimeout(() => setCopiedType(null), 2500);
              }}
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedType === 'master' ? (
                <>
                  <Check className="w-5 h-5 text-emerald-300 stroke-[3]" />
                  <span className="text-emerald-200">COPIED TO CLIPBOARD! READY TO PASTE</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>TAKE EVERYTHING (1-Click Copy Title + Description + Tags)</span>
                </>
              )}
            </button>

            {/* Individual Quick Copy Slots */}
            <div className="space-y-2 pt-1 text-xs">
              {/* Title */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Shorts Title (High CTR)</span>
                  <span className="font-bold text-white truncate block">{clip.clickPack?.shortTitle || clip.title}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(clip.clickPack?.shortTitle || clip.title);
                    setCopiedType('title');
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'title' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Pinned Comment */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate flex-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pinned Comment (Algorithm Booster)</span>
                  <span className="text-slate-300 truncate block text-[11px]">{clip.clickPack?.pinnedComment || 'What did you think of this? Drop a comment! 👇'}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(clip.clickPack?.pinnedComment || 'What did you think of this? Drop a comment! 👇');
                    setCopiedType('comment');
                    setTimeout(() => setCopiedType(null), 2000);
                  }}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'comment' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'comment' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Direct Open YouTube Upload Link */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <a
                href="https://studio.youtube.com/channel/UC/videos/short"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <span>Open YouTube Studio to Paste</span>
                <span className="text-red-400 font-mono">→</span>
              </a>

              <button
                onClick={handleDownloadSrt}
                className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SRT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
