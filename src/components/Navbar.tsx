import React from 'react';
import { Sparkles, Download, Youtube, ExternalLink, Zap } from 'lucide-react';

interface NavbarProps {
  onNewBatchClick: () => void;
  onExportAllClick: () => void;
  onTestClick?: () => void;
  onOpenInstaller?: () => void;
  totalClips: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewBatchClick,
  onExportAllClick,
  onTestClick,
  onOpenInstaller,
  totalClips
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Brand title wordmark & Autonomous AI badge */}
      <div className="flex items-center gap-3">
        <a href="/" className="text-xl font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/30">
            <Youtube className="w-5 h-5 fill-white" />
          </span>
          <span>Shorts<span className="text-red-500">Forge</span></span>
        </a>

        {/* Self-Installed AI Engine Status Badge */}
        {onOpenInstaller ? (
          <button
            onClick={onOpenInstaller}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/80 hover:border-emerald-500 text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-900/30"
            title="Click to view installed internal AI models & features"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Self-Installed</span>
            <span className="text-[10px] text-emerald-300 font-mono bg-emerald-900/60 px-1.5 py-0.2 rounded">Auto</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Self-Installed</span>
          </span>
        )}
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
        <a href="#generator" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
          Paste YouTube Link
        </a>
        <a href="#studio" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
          Shorts Studio
        </a>
        <a href="#clips-matrix" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
          Viral Clips ({totalClips})
        </a>
      </nav>

      {/* Zone 3: Direct 1-Click Upload & Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Test Demo Button */}
        {onTestClick && (
          <button
            onClick={onTestClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 bg-amber-950/80 hover:bg-amber-900/80 border border-amber-600/60 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
            title="Instant test drive with pre-loaded viral shorts"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>⚡ Test Drive</span>
          </button>
        )}

        {/* Direct link to YouTube Studio to upload and paste directly */}
        <a
          href="https://studio.youtube.com/channel/UC/videos/short"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-red-600/40 rounded-xl transition-all shadow-sm shadow-red-600/10 whitespace-nowrap shrink-0"
          title="Open YouTube Studio Upload in new tab"
        >
          <Youtube className="w-3.5 h-3.5 text-red-500 fill-current" />
          <span>Open YouTube Studio</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>

        {totalClips > 0 && (
          <button
            onClick={onExportAllClick}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ZIP ({totalClips})</span>
          </button>
        )}

        <button
          onClick={onNewBatchClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-md shadow-red-600/30 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Paste Link</span>
        </button>
      </div>
    </header>
  );
};
