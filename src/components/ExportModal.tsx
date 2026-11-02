import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, Package, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { Clip, VideoProject } from '../types';
import { downloadBatchZip, downloadSingleFile } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clips: Clip[];
  project: VideoProject | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  clips,
  project
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    if (!project) return;
    setIsExporting(true);
    setExportComplete(false);
    try {
      await downloadBatchZip(project, clips);
      setExportComplete(true);
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
    }
  };

  const handleDownloadCsv = () => {
    let csvContent = 'Clip ID,Shorts Title,Original Title,Start Seconds,End Seconds,Duration,Virality Score,Tags,Pinned Comment,Description\n';
    clips.forEach((c) => {
      const escapedShortsTitle = `"${(c.clickPack?.shortTitle || c.title).replace(/"/g, '""')}"`;
      const escapedTitle = `"${c.title.replace(/"/g, '""')}"`;
      const escapedTags = `"${(c.clickPack?.hashtags || c.tags.join(' ')).replace(/"/g, '""')}"`;
      const escapedPinned = `"${(c.clickPack?.pinnedComment || '').replace(/"/g, '""')}"`;
      const escapedDesc = `"${(c.clickPack?.description || c.socialCopy.youtube).replace(/"/g, '""')}"`;
      csvContent += `${c.id},${escapedShortsTitle},${escapedTitle},${c.startTime},${c.endTime},${c.duration}s,${c.viralityScore},${escapedTags},${escapedPinned},${escapedDesc}\n`;
    });
    downloadSingleFile(`shorts_clicks_manifest_${clips.length}_clips.csv`, csvContent, 'text/csv');
  };

  const generateAllClipsText = () => {
    let text = `YOUTUBE SHORTS CLICK ENGINE - ${clips.length} VIRAL PACKS\nPROJECT: ${project?.title || 'Video'}\n\n`;
    clips.forEach((c, idx) => {
      text += `==========================================\n`;
      text += `SHORT #${idx + 1}: ${(c.clickPack?.shortTitle || c.title).toUpperCase()}\n`;
      text += `VIRALITY SCORE: ${c.viralityScore}/100 | DURATION: ${c.duration}s (${c.startTime}s - ${c.endTime}s)\n`;
      text += `FIRST-SENTENCE HOOK: ${c.clickPack?.firstSentenceHook || ''}\n\n`;
      text += `--- TAKE & PASTE BUNDLE ---\n`;
      text += `TITLE:\n${c.clickPack?.shortTitle || c.title}\n\n`;
      text += `DESCRIPTION:\n${c.clickPack?.description || c.socialCopy.youtube}\n\n`;
      text += `PINNED COMMENT:\n${c.clickPack?.pinnedComment || ''}\n\n`;
      text += `TAGS:\n${c.clickPack?.hashtags || c.tags.join(', ')}\n\n`;
    });
    return text;
  };

  const handleCopyAllToClipboard = async () => {
    const text = generateAllClipsText();
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleDownloadAllCaptionsText = () => {
    const text = generateAllClipsText();
    downloadSingleFile(`shorts_take_and_paste_all.txt`, text, 'text/plain');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
          <Package className="w-4 h-4" />
          <span>Batch Export Suite</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          Export {clips.length} Viral Clips
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Everything is bundled with word-level subtitles, high-converting social media scripts, and scheduling spreadsheets—100% free with no watermarks.
        </p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Main ZIP Download */}
          <div
            onClick={handleDownloadZip}
            className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/50 hover:border-indigo-400 cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Master ZIP Archive (Recommended)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900 text-indigo-300 font-bold">
                  All-In-One
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Contains individual .SRT subtitle files for all {clips.length} clips, individual script text files, and full CSV timestamp manifest.
              </p>
            </div>
          </div>

          {/* CSV Spreadsheet */}
          <div
            onClick={handleDownloadCsv}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">CSV Content Scheduling Manifest</span>
                <span className="text-[10px] font-mono text-emerald-400">Excel / Sheets</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Spreadsheet ready to import into Buffer, Hootsuite, Notion, or Airtable for automated social posting.
              </p>
            </div>
          </div>

          {/* 1-Click Copy All to Clipboard */}
          <div
            onClick={handleCopyAllToClipboard}
            className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 hover:border-rose-400 cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {copiedAll ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">
                  {copiedAll ? 'Copied All to Clipboard!' : '1-Click "Take & Paste All"'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900 text-rose-200 font-bold">
                  {copiedAll ? '✓ READY' : 'INSTANT CLIPBOARD'}
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-1">
                Copies all {clips.length} viral titles, descriptions, pinned comments, and tags in one click. Just take it and paste directly into YouTube Studio!
              </p>
            </div>
          </div>

          {/* Social Captions Text File */}
          <div
            onClick={handleDownloadAllCaptionsText}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Full Social Captions & Scripts (.TXT)</span>
                <span className="text-[10px] font-mono text-purple-400">Clean Text</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                One master text document containing all viral hooks, copy, and hashtag packages for quick copy-pasting.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & YouTube Studio Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open YouTube Studio Upload ↗</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAllToClipboard}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              {copiedAll ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy All Packs'}</span>
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isExporting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-2"
            >
              {isExporting ? (
                <span>Packing ZIP Archive...</span>
              ) : exportComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
