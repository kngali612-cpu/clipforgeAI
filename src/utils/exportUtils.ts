import JSZip from 'jszip';
import { Clip, VideoProject } from '../types';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeDetailed(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

export function generateSrtContent(clip: Clip): string {
  let srt = '';
  const words = clip.words && clip.words.length > 0 ? clip.words : [
    { word: clip.title, start: clip.startTime, end: clip.endTime }
  ];

  // Group into ~3-4 words per caption line for punchy short-form display
  const chunkSize = 4;
  let counter = 1;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    const start = chunk[0].start;
    const end = chunk[chunk.length - 1].end;
    const text = chunk.map(w => w.word).join(' ');

    srt += `${counter}\n`;
    srt += `${formatTimeDetailed(start)} --> ${formatTimeDetailed(end)}\n`;
    srt += `${text}\n\n`;
    counter++;
  }

  return srt;
}

export function generateVttContent(clip: Clip): string {
  let vtt = 'WEBVTT\n\n';
  const srtBody = generateSrtContent(clip);
  vtt += srtBody.replace(/,/g, '.');
  return vtt;
}

export async function downloadBatchZip(project: VideoProject, clips: Clip[]) {
  const zip = new JSZip();

  // Create folders
  const subtitlesFolder = zip.folder('subtitles_srt');
  const scriptsFolder = zip.folder('social_scripts');

  // Master CSV with timestamps & virality
  let csvContent = 'Clip ID,Title,Start Time,End Time,Duration,Virality Score,Hook Score,Tags,TikTok Caption\n';

  clips.forEach((clip) => {
    // 1. Add SRT
    const srt = generateSrtContent(clip);
    subtitlesFolder?.file(`${clip.id}_subtitles.srt`, srt);

    // 2. Add social media script with YouTube Click Pack
    const script = `TITLE: ${clip.title}
DURATION: ${clip.duration}s (${formatTime(clip.startTime)} - ${formatTime(clip.endTime)})
VIRALITY SCORE: ${clip.viralityScore}/100

=========================================
YOUTUBE SHORTS "TAKE & PASTE" CLICK PACK:
=========================================
SHORTS TITLE: ${clip.clickPack?.shortTitle || clip.title}
VIRAL HOOK: ${clip.clickPack?.firstSentenceHook || ''}

YOUTUBE DESCRIPTION:
${clip.clickPack?.description || clip.socialCopy.youtube}

PINNED COMMENT (CTR BOOSTER):
${clip.clickPack?.pinnedComment || ''}

TAGS:
${clip.clickPack?.hashtags || clip.tags.join(', ')}

=========================================
TRANSCRIPT SUMMARY:
${clip.captionSummary}

TIKTOK / REELS CAPTION:
${clip.socialCopy.tiktok}

INSTAGRAM POST:
${clip.socialCopy.instagram}

X / TWITTER POST:
${clip.socialCopy.x}
`;
    scriptsFolder?.file(`${clip.id}_script.txt`, script);

    // CSV Row (escape quotes)
    const escapedTitle = `"${clip.title.replace(/"/g, '""')}"`;
    const escapedShortsTitle = `"${(clip.clickPack?.shortTitle || clip.title).replace(/"/g, '""')}"`;
    const escapedCaption = `"${clip.socialCopy.tiktok.replace(/"/g, '""')}"`;
    const escapedTags = `"${(clip.clickPack?.hashtags || clip.tags.join(' ')).replace(/"/g, '""')}"`;
    csvContent += `${clip.id},${escapedShortsTitle},${escapedTitle},${formatTime(clip.startTime)},${formatTime(clip.endTime)},${clip.duration}s,${clip.viralityScore},${clip.metrics?.hookScore ?? clip.viralityScore},${escapedTags},${escapedCaption}\n`;
  });

  zip.file('batch_clips_manifest.csv', csvContent);

  // Add JSON project metadata
  zip.file('project_summary.json', JSON.stringify({
    project,
    totalClips: clips.length,
    generatedAt: new Date().toISOString(),
    clips: clips.map(c => ({
      id: c.id,
      title: c.title,
      start: c.startTime,
      end: c.endTime,
      score: c.viralityScore,
      tags: c.tags
    }))
  }, null, 2));

  // Generate blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ClipForge_Batch_${clips.length}_Clips.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(filename: string, content: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
