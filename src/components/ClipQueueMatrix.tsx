import React, { useState, useMemo } from 'react';
import {
  Flame,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Play,
  Grid,
  List,
  Sparkles,
  ArrowUpDown,
  Clock,
  Scan,
  Share2
} from 'lucide-react';
import { Clip, VideoProject } from '../types';
import { formatTime, generateSrtContent, downloadSingleFile } from '../utils/exportUtils';

interface ClipQueueMatrixProps {
  clips: Clip[];
  selectedClipId: string | null;
  onSelectClip: (clip: Clip) => void;
  onExportSelected: (selectedClips: Clip[]) => void;
  onExpandBatch: (additionalCount: number) => void;
  project: VideoProject | null;
}

export const ClipQueueMatrix: React.FC<ClipQueueMatrixProps> = ({
  clips,
  selectedClipId,
  onSelectClip,
  onExportSelected,
  onExpandBatch,
  project
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minVirality, setMinVirality] = useState<number>(0);
  const [durationFilter, setDurationFilter] = useState<'all' | 'under30' | '30to60'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);

  const filteredClips = useMemo(() => {
    return clips
      .filter((clip) => {
        if (minVirality > 0 && clip.viralityScore < minVirality) return false;
        if (durationFilter === 'under30' && clip.duration >= 30) return false;
        if (durationFilter === '30to60' && (clip.duration < 30 || clip.duration > 60)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = clip.title.toLowerCase().includes(q);
          const matchHeadline = clip.hookHeadline?.toLowerCase().includes(q);
          const matchTags = clip.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchHeadline && !matchTags) return false;
        }
        return true;
      })
      .sort((a, b) => b.viralityScore - a.viralityScore);
  }, [clips, minVirality, durationFilter, searchQuery]);

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredClips.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredClips.map((c) => c.id)));
    }
  };

  const handleCopyCaption = (clip: Clip, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(clip.socialCopy.tiktok);
    setCopiedClipId(clip.id);
    setTimeout(() => setCopiedClipId(null), 2000);
  };

  const handleDownloadSrt = (clip: Clip, e: React.MouseEvent) => {
    e.stopPropagation();
    const srt = generateSrtContent(clip);
    downloadSingleFile(`${clip.id}_subtitles.srt`, srt, 'text/plain');
  };

  return (
    <section id="clips-matrix" className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-bold text-purple-400">OpusClip Matrix</span>
            <span>·</span>
            <span>Sorted by Virality Score</span>
            <span>·</span>
            <span className="text-emerald-400 font-semibold">100% Free Unlimited</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Generated Viral Slices</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800 tabular-nums">
              {clips.length} Clips Ready
            </span>
          </h2>
        </div>

        {/* Bulk Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onExpandBatch(100)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-purple-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate +100 Slices</span>
          </button>

          <button
            onClick={() => onExportSelected(selectedIds.size > 0 ? clips.filter((c) => selectedIds.has(c.id)) : clips)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-purple-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              Export {selectedIds.size > 0 ? `${selectedIds.size} Selected` : `All ${clips.length}`} (ZIP)
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hooks, keywords, or topics..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 font-medium transition-colors"
            >
              {selectedIds.size === filteredClips.length ? 'Deselect All' : 'Select All'}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-800 bg-slate-950 rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Virality Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-purple-400" />
            <span>Virality Score:</span>
            {[
              { label: 'All', val: 0 },
              { label: '90+ God Tier', val: 90 },
              { label: '80+ High', val: 80 },
              { label: '70+ Solid', val: 70 }
            ].map((v) => (
              <button
                key={v.val}
                onClick={() => setMinVirality(v.val)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  minVirality === v.val
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Duration:</span>
            {[
              { label: 'Any', id: 'all' },
              { label: '<30s Shorts', id: 'under30' },
              { label: '30-60s Reels', id: '30to60' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDurationFilter(d.id as any)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  durationFilter === d.id
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredClips.map((clip) => {
            const isSelected = selectedClipId === clip.id;
            const isChecked = selectedIds.has(clip.id);

            return (
              <div
                key={clip.id}
                onClick={() => onSelectClip(clip)}
                className={`group relative bg-slate-900 border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-2xl ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Visual Thumbnail */}
                <div className="relative aspect-[9/10] bg-slate-950 overflow-hidden">
                  <img
                    src={
                      clip.index % 2 === 0
                        ? '/src/assets/images/opus_host_face_1793534904244.jpg'
                        : '/src/assets/images/opus_guest_face_1793534920593.jpg'
                    }
                    alt={clip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60" />

                  {/* Select Checkbox */}
                  <div
                    onClick={(e) => handleToggleSelect(clip.id, e)}
                    className="absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded border bg-slate-950/80 backdrop-blur-sm flex items-center justify-center cursor-pointer transition-colors border-slate-600 hover:border-white"
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 text-purple-400 stroke-[3]" />}
                  </div>

                  {/* OpusClip Rank & Virality Gauge */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/85 border border-slate-700 backdrop-blur-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-mono font-black text-white tabular-nums">
                      {clip.viralityScore}
                    </span>
                  </div>

                  {/* Top Hook Banner */}
                  <div className="absolute top-10 inset-x-3 text-center pointer-events-none">
                    <span className="inline-block px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] uppercase font-mono rounded shadow">
                      {clip.hookHeadline}
                    </span>
                  </div>

                  {/* Play hover button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xl">
                      <Play className="w-5 h-5 fill-white translate-x-0.5" />
                    </div>
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute bottom-2 right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-slate-300">
                    {clip.duration}s
                  </div>

                  {/* AI Face Tracking Tag */}
                  <div className="absolute bottom-2 left-2 text-[9px] font-mono text-purple-300 px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-800 flex items-center gap-1">
                    <Scan className="w-2.5 h-2.5" />
                    <span>Auto-Track</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="font-bold text-purple-400">#{clip.index}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-300">{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-mono">Hook {clip.metrics?.hookScore ?? Math.min(99, (clip.viralityScore || 85) + 1)}%</span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-2 group-hover:text-purple-300 transition-colors leading-snug">
                    {clip.title}
                  </h3>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {clip.viralityReason}
                  </p>

                  {/* Card Actions: Take & Paste Directly */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const text = `${clip.clickPack?.shortTitle || clip.title}\n\n${clip.clickPack?.description || clip.captionSummary}\n\n${clip.tags?.join(' ') || '#shorts #viral'}\n\nPINNED COMMENT:\n${clip.clickPack?.pinnedComment || 'Drop your thoughts below! 👇'}`;
                        navigator.clipboard.writeText(text);
                        setCopiedClipId(clip.id);
                        setTimeout(() => setCopiedClipId(null), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedClipId === clip.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Copied! Ready to Paste</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Take & Paste</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-slate-400">
                      <a
                        href="https://studio.youtube.com/channel/UC/videos/short"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Open YouTube Studio Upload"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={(e) => handleDownloadSrt(clip, e)}
                        className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download Subtitles (.SRT)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredClips.length && filteredClips.length > 0}
                      onChange={handleSelectAll}
                      className="rounded accent-purple-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Hook Title & Banner</th>
                  <th className="py-3 px-4 text-center">Virality</th>
                  <th className="py-3 px-4 text-right">Timestamps</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredClips.map((clip) => {
                  const isSelected = selectedClipId === clip.id;
                  const isChecked = selectedIds.has(clip.id);

                  return (
                    <tr
                      key={clip.id}
                      onClick={() => onSelectClip(clip)}
                      className={`cursor-pointer transition-colors hover:bg-slate-800/60 ${
                        isSelected ? 'bg-purple-950/40' : ''
                      }`}
                    >
                      <td className="py-3 px-4" onClick={(e) => handleToggleSelect(clip.id, e)}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded accent-purple-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-400">#{clip.index}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{clip.title}</div>
                        <div className="text-[11px] text-amber-400 font-mono font-bold">{clip.hookHeadline}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                        {clip.viralityScore}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {clip.duration}s
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleCopyCaption(clip, e)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDownloadSrt(clip, e)}
                            className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
