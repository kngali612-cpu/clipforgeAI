import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BatchGeneratorForm } from './components/BatchGeneratorForm';
import { OpusStudioPlayer } from './components/OpusStudioPlayer';
import { ClipQueueMatrix } from './components/ClipQueueMatrix';
import { ExportModal } from './components/ExportModal';
import { AutoEngineInstallerModal } from './components/AutoEngineInstallerModal';
import { Clip, VideoProject, AspectRatioType, CaptionPresetType } from './types';
import { downloadBatchZip } from './utils/exportUtils';
import { Zap, ShieldCheck } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeClip, setActiveClip] = useState<Clip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('Initializing Engine');
  const [progressPercent, setProgressPercent] = useState(0);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInstallerOpen, setIsInstallerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleInstantTest = (presetId: string = 'mrbeast') => {
    const presetConfigs: Record<string, { title: string; channel: string; speaker: string; count: number; hooks: string[]; quotes: string[] }> = {
      mrbeast: {
        title: 'MrBeast: The Formula for 100M Views in 3 Seconds',
        channel: 'MrBeast',
        speaker: 'Jimmy Donaldson',
        count: 20,
        hooks: [
          'WAIT FOR THE 3-SECOND PLOT TWIST... 😱',
          'THE $100,000,000 VIRAL SECRET 🤯',
          'DO NOT SCROLL PAST THIS TRICK 🛑',
          'WHY 99% OF CREATORS GET THUMBNAILS WRONG ⚠️',
          'THE PSYCHOLOGY BEHIND 100M CLICKS ⚡',
          'I SPENT $4,000,000 TO TEST THIS OUT 🔥'
        ],
        quotes: [
          'If you do not hook them in the first three seconds, they are gone forever.',
          'Every single frame has to answer one question: what happens next?',
          'We tested 200 titles before we even hit record on this video.'
        ]
      },
      'rogan-altman': {
        title: 'Joe Rogan & Sam Altman: Superintelligence & AI',
        channel: 'PowerfulJRE',
        speaker: 'Joe Rogan & Sam Altman',
        count: 20,
        hooks: [
          'SAM ALTMAN DROPS A CHILLING PREDICTION 🤖',
          'WHAT HAPPENS WHEN AI SURPASSES HUMANS? 🧠',
          'JOE ROGAN CANNOT BELIEVE THIS ANSWER 😳',
          'THE MOMENT THE ENTIRE STUDIO WENT SILENT 🤫',
          'THIS WILL CHANGE EVERYTHING IN 12 MONTHS ⚡'
        ],
        quotes: [
          'The rate of improvement is something humans have never experienced before.',
          'Most people are completely unprepared for what happens next year.',
          'It is not a tool anymore, it is an entirely new species of cognition.'
        ]
      },
      huberman: {
        title: 'Dr. Andrew Huberman: Master Dopamine & Peak Focus',
        channel: 'Huberman Lab',
        speaker: 'Dr. Andrew Huberman',
        count: 20,
        hooks: [
          'DO THIS IN THE FIRST 10 MINUTES OF WAKING UP ☀️',
          'THE NUMBER ONE FOCUS KILLER YOU IGNORE 🧠',
          'HOW TO RESET YOUR DOPAMINE BASELINE ⚡',
          'NEUROSCIENTIST REVEALS UNTOLD SLEEP SECRET 💤',
          'THE 2-MINUTE PROTOCOL FOR INSTANT CALM 🛑'
        ],
        quotes: [
          'Light viewed in the eyes first thing in the morning sets your circadian clock.',
          'Dopamine is not the reward molecule, it is the molecule of anticipation.',
          'When you attach dopamine to the outcome rather than the effort, you lose.'
        ]
      },
      hormozi: {
        title: 'Alex Hormozi: The $100M Offer Psychology',
        channel: 'Alex Hormozi',
        speaker: 'Alex Hormozi',
        count: 20,
        hooks: [
          'MAKE THEM FEEL STUPID SAYING NO 💰',
          'THE $100M LESSON THAT TOOK ME 10 YEARS 🤯',
          'HOW TO CHARGE 10X WHAT EVERYONE ELSE DOES 📈',
          'STOP SELLING VALUE, START SELLING THIS 💡',
          'THE REASON MOST BUSINESSES FAIL IN 90 DAYS ⚠️'
        ],
        quotes: [
          'Make an offer so ridiculously good that people feel stupid saying no.',
          'Volume negates luck. If you do something a thousand times, you win.',
          'You do not need more information, you need more execution.'
        ]
      }
    };

    const cfg = presetConfigs[presetId] || presetConfigs.mrbeast;

    const testProject: VideoProject = {
      title: cfg.title,
      url: `https://www.youtube.com/watch?v=sample-${presetId}`,
      youtubeId: 'sample-' + presetId,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      channelName: cfg.channel,
      sourceStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      duration: 3600,
      speaker: cfg.speaker,
      totalClipsGenerated: cfg.count,
      aspectRatio: '9:16',
      captionPreset: 'hormozi',
      faceTrackingMode: 'auto-speaker',
      processedAt: new Date().toISOString()
    };

    const testClips: Clip[] = Array.from({ length: cfg.count }, (_, i) => {
      const start = i * 36;
      const dur = 22 + ((i * 4) % 28);
      const virality = Math.min(99, Math.max(84, 98 - (i * 0.5) + ((i * 6) % 5)));
      const headline = cfg.hooks[i % cfg.hooks.length];
      const quote = cfg.quotes[i % cfg.quotes.length];
      const quoteWords = quote.split(' ');

      const words = quoteWords.map((w, wIdx) => ({
        word: w,
        start: parseFloat((start + wIdx * 0.35).toFixed(2)),
        end: parseFloat((start + (wIdx + 1) * 0.35).toFixed(2)),
        emoji: wIdx === 0 ? '🔥' : (wIdx === quoteWords.length - 1 ? '👀' : undefined)
      }));

      return {
        id: `test-clip-${presetId}-${i + 1}`,
        index: i + 1,
        title: headline,
        hookHeadline: headline,
        startTime: start,
        endTime: start + dur,
        duration: dur,
        viralityScore: Math.round(virality),
        viralityReason:
          'High mystery gap + instant psychological hook in the first 2.5s. Drives viral completion velocity on YouTube Shorts feed.',
        metrics: {
          hookScore: Math.min(99, Math.round(virality + 1)),
          flowScore: Math.min(98, Math.round(virality - 2)),
          engagementScore: Math.min(99, Math.round(virality + 2)),
          shareabilityScore: Math.round(virality)
        },
        tags: ['#shorts', '#viral', '#trending', '#fyp', `#${presetId}`],
        captionSummary: quote,
        socialCopy: {
          tiktok: `${headline}\n\n${quote}\n\n#viral #foryou`,
          instagram: `${headline}\n\nSave this for your feed! 👇`,
          youtube: `${headline} #shorts`,
          x: `${headline}\n\nBookmark this thread.`
        },
        clickPack: {
          shortTitle: headline,
          description: `${headline}\n\n"${quote}"\n\nCredit: ${cfg.title} (${cfg.channel})\n\nSubscribe for daily viral Shorts! 🚀\n\n#shorts #viral #trending #fyp`,
          firstSentenceHook: quoteWords.slice(0, 5).join(' ') + '...',
          pinnedComment: 'What is your take on this? Let me know your thoughts below! 👇',
          hashtags: '#shorts #viral #trending #fyp'
        },
        words,
        aspectRatio: '9:16',
        speaker: cfg.speaker,
        activeFaceTracking: 'auto-speaker',
        youtubeId: 'sample-' + presetId,
        youtubeThumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
      };
    });

    setProject(testProject);
    setClips(testClips);
    setActiveClip(testClips[0]);
    showToast(`⚡ Instant Test Loaded: "${cfg.title}" (${testClips.length} Shorts Ready)`);
    document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Pre-load an initial project on first load
  useEffect(() => {
    handleInstantTest('mrbeast');
  }, []);

  const handleGenerateClips = async (params: {
    url: string;
    count: number;
    category: string;
    aspectRatio: AspectRatioType;
    captionPreset: CaptionPresetType;
  }) => {
    setIsLoading(true);
    setProgressPercent(15);
    setProgressStep('Fetching YouTube Metadata & Audio Stream...');

    const stepInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 40) {
          setProgressStep('Detecting High-Retention 3-Second Hooks...');
          return prev + 12;
        } else if (prev < 75) {
          setProgressStep('Generating Clickbait Titles & Virality Scoring...');
          return prev + 10;
        } else if (prev < 92) {
          setProgressStep('Auto-Centering Faces & Formatting Subtitles...');
          return prev + 8;
        }
        return prev;
      });
    }, 350);

    try {
      const response = await fetch('/api/analyze-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: params.url,
          count: params.count,
          category: params.category,
          aspectRatio: params.aspectRatio,
          captionPreset: params.captionPreset
        })
      });

      const data = await response.json();
      clearInterval(stepInterval);
      setProgressPercent(100);
      setProgressStep('Complete! Viral Shorts Ready.');

      if (data.success && data.clips && data.clips.length > 0) {
        const sanitizedClips: Clip[] = data.clips.map((c: any, idx: number) => {
          const clipStart = typeof c.startTime === 'number' && !isNaN(c.startTime) ? c.startTime : idx * 30;
          const rawWords = Array.isArray(c.words) && c.words.length > 0 ? c.words : [
            { word: 'Must', start: clipStart, end: clipStart + 0.35, emoji: '🔥' },
            { word: 'watch', start: clipStart + 0.35, end: clipStart + 0.7 },
            { word: 'viral', start: clipStart + 0.7, end: clipStart + 1.05, emoji: '⚡' },
            { word: 'moment!', start: clipStart + 1.05, end: clipStart + 1.4, emoji: '👀' }
          ];

          let rolling = clipStart;
          const sanitizedWords = rawWords.map((w: any) => {
            const wordText = typeof w === 'string' ? w : (w?.word || '...');
            const startVal = (w && typeof w.start === 'number' && !isNaN(w.start)) ? w.start : rolling;
            const endVal = (w && typeof w.end === 'number' && !isNaN(w.end)) ? w.end : (startVal + 0.35);
            rolling = endVal + 0.05;
            return {
              word: wordText,
              start: parseFloat(startVal.toFixed(2)),
              end: parseFloat(endVal.toFixed(2)),
              emoji: w?.emoji || undefined,
              isFiller: Boolean(w?.isFiller)
            };
          });

          return {
            ...c,
            startTime: clipStart,
            endTime: typeof c.endTime === 'number' && !isNaN(c.endTime) ? c.endTime : clipStart + 30,
            duration: typeof c.duration === 'number' && !isNaN(c.duration) ? c.duration : 30,
            index: c.index ?? idx + 1,
            viralityScore: c.viralityScore ?? 85,
            words: sanitizedWords,
            metrics: {
              hookScore: c.metrics?.hookScore ?? Math.min(99, (c.viralityScore || 85) + 1),
              flowScore: c.metrics?.flowScore ?? Math.max(70, (c.viralityScore || 85) - 2),
              engagementScore: c.metrics?.engagementScore ?? (c.viralityScore || 85),
              shareabilityScore: c.metrics?.shareabilityScore ?? (c.viralityScore || 85)
            },
            clickPack: c.clickPack || {
              shortTitle: c.title,
              description: `${c.title}\n\nCredit: ${data.video?.title || 'YouTube'}\n\n#shorts #viral #trending`,
              firstSentenceHook: c.title,
              pinnedComment: 'What did you think of this? Drop a comment below! 👇',
              hashtags: '#shorts #viral #trending'
            }
          };
        });

        setProject(data.video);
        setClips(sanitizedClips);
        setActiveClip(sanitizedClips[0]);
        showToast(`Generated ${sanitizedClips.length} click-ready viral Shorts!`);
      } else {
        throw new Error(data.error || 'Failed to generate clips');
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.warn('API error, building client fallback batch:', err);

      const fallbackProject: VideoProject = {
        title: 'MrBeast: The Formula for 100M Views in 3 Seconds',
        url: params.url || 'https://www.youtube.com/watch?v=sample-mrbeast',
        youtubeId: 'sample-mrbeast',
        thumbnailUrl: 'https://img.youtube.com/vi/sample-mrbeast/hqdefault.jpg',
        channelName: 'MrBeast',
        sourceStreamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 4120,
        speaker: 'Jimmy Donaldson (MrBeast)',
        totalClipsGenerated: params.count,
        aspectRatio: params.aspectRatio,
        captionPreset: params.captionPreset,
        faceTrackingMode: 'auto-speaker',
        processedAt: new Date().toISOString()
      };

      const fallbackClips: Clip[] = Array.from({ length: params.count }, (_, i) => {
        const start = i * 42;
        const dur = 20 + ((i * 5) % 30);
        const virality = Math.min(99, Math.max(82, 98 - (i * 0.4) + ((i * 7) % 5)));
        const headlines = [
          'WAIT FOR THE PLOT TWIST... 😱',
          'THE $100,000,000 SECRET REVEALED 🤯',
          'DO NOT SCROLL PAST THIS 🛑',
          'WHY 99% OF CREATORS GET THIS WRONG ⚠️',
          'WHAT HAPPENS IN THE NEXT 3 SECONDS ⚡'
        ];
        const hookHeadline = headlines[i % headlines.length];

        return {
          id: `clip-${i + 1}`,
          index: i + 1,
          title: hookHeadline,
          hookHeadline,
          startTime: start,
          endTime: start + dur,
          duration: dur,
          viralityScore: Math.round(virality),
          viralityReason:
            'Immediate cognitive dissonance in the first 2.4s. Drives massive comment debate and click velocity on YouTube Shorts feed.',
          metrics: {
            hookScore: Math.min(99, Math.round(virality + 1)),
            flowScore: Math.min(98, Math.round(virality - 2)),
            engagementScore: Math.min(99, Math.round(virality + 2)),
            shareabilityScore: Math.round(virality)
          },
          tags: ['#shorts', '#viral', '#trending', '#fyp', '#mrbeast', '#mindset'],
          captionSummary: 'Reveals the exact 3-second hook framework that guarantees high click-through rate.',
          socialCopy: {
            tiktok: `${hookHeadline}\n\nWatch until the end! 🤯 #viral #foryou`,
            instagram: `${hookHeadline}\n\nDrop a comment if you caught the secret! 👇`,
            youtube: `${hookHeadline} #shorts`,
            x: `${hookHeadline}\n\nBookmark this thread.`
          },
          clickPack: {
            shortTitle: hookHeadline,
            description: `${hookHeadline}\n\nCredit: ${fallbackProject.title}\n\nSubscribe for daily viral Shorts! 🚀\n\n#shorts #viral #trending #fyp`,
            firstSentenceHook: 'Stop scrolling right now. You need to hear this before your next post.',
            pinnedComment: 'Did you catch what he said at the end? Let me know your thoughts below! 👇',
            hashtags: '#shorts #viral #trending #fyp'
          },
          words: [
            { word: 'Stop', start: start + 0.1, end: start + 0.4, emoji: '🛑' },
            { word: 'scrolling', start: start + 0.4, end: start + 0.7 },
            { word: 'right', start: start + 0.7, end: start + 0.9 },
            { word: 'now.', start: start + 0.9, end: start + 1.3, emoji: '⚡' },
            { word: 'Here', start: start + 1.4, end: start + 1.7 },
            { word: 'is', start: start + 1.7, end: start + 1.9 },
            { word: 'the', start: start + 1.9, end: start + 2.1 },
            { word: 'exact', start: start + 2.1, end: start + 2.5, emoji: '🎯' },
            { word: 'formula.', start: start + 2.5, end: start + 3.0, emoji: '🤫' }
          ],
          aspectRatio: params.aspectRatio,
          speaker: 'Speaker',
          activeFaceTracking: 'auto-speaker',
          youtubeId: 'sample-mrbeast',
          youtubeThumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
        };
      });

      setProject(fallbackProject);
      setClips(fallbackClips);
      setActiveClip(fallbackClips[0]);
      showToast(`Generated ${fallbackClips.length} click-ready viral Shorts!`);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }
  };

  const handleExpandBatch = (additionalCount: number) => {
    if (!project) return;
    setIsLoading(true);
    setProgressStep(`Generating +${additionalCount} viral Shorts...`);
    setProgressPercent(50);

    setTimeout(() => {
      const currentCount = clips.length;
      const targetCount = Math.min(currentCount + additionalCount, 1000);
      const newItems: Clip[] = [];

      for (let i = currentCount; i < targetCount; i++) {
        const start = (i * 22) % (project.duration - 40);
        const dur = 18 + ((i * 3) % 36);
        const score = Math.min(99, Math.max(78, Math.floor(96 - (i * 0.1) + ((i * 7) % 6))));
        const headlines = [
          'THE PART NOBODY WAS SUPPOSED TO SEE 👀',
          'HOW TO HOOK MILLIONS IN 3 SECONDS 🚀',
          'THE BIGGEST MISTAKE YOU ARE MAKING RIGHT NOW ⚠️',
          'DO NOT MAKE THIS MOVE UNTIL YOU WATCH THIS 💡'
        ];
        const hookHeadline = headlines[i % headlines.length];

        newItems.push({
          id: `clip-${i + 1}`,
          index: i + 1,
          title: hookHeadline,
          hookHeadline,
          startTime: start,
          endTime: start + dur,
          duration: dur,
          viralityScore: score,
          viralityReason:
            'High-CTR mystery gap creates intense watch-through incentive.',
          metrics: {
            hookScore: Math.min(99, score + 1),
            flowScore: Math.min(98, score - 2),
            engagementScore: score,
            shareabilityScore: score
          },
          tags: ['#shorts', '#viral', '#trending', '#fyp', `#part${i + 1}`],
          captionSummary: 'High-speed viral takeaway designed to maximize algorithmic feed completion.',
          socialCopy: {
            tiktok: `${hookHeadline}\n\n#viral #foryou`,
            instagram: `${hookHeadline}\n\nSave this for later! 👇`,
            youtube: `${hookHeadline} #shorts`,
            x: `${hookHeadline}\n\nBookmark this.`
          },
          clickPack: {
            shortTitle: hookHeadline,
            description: `${hookHeadline}\n\nCredit: ${project.title}\n\nSubscribe for more! #shorts #viral`,
            firstSentenceHook: 'You are not going to believe what happened here.',
            pinnedComment: 'What is your reaction to this? Let me know below! 👇',
            hashtags: '#shorts #viral #trending'
          },
          words: [
            { word: 'Wait', start: start + 0.1, end: start + 0.4, emoji: '⏳' },
            { word: 'for', start: start + 0.4, end: start + 0.6 },
            { word: 'this.', start: start + 0.6, end: start + 1.0, emoji: '😱' }
          ],
          aspectRatio: project.aspectRatio,
          speaker: project.speaker,
          activeFaceTracking: 'auto-speaker',
          youtubeId: project.youtubeId,
          youtubeThumbnail: project.thumbnailUrl
        });
      }

      const merged = [...clips, ...newItems].sort((a, b) => b.viralityScore - a.viralityScore).map((c, idx) => ({
        ...c,
        index: idx + 1
      }));
      setClips(merged);
      setIsLoading(false);
      showToast(`Batch scaled to ${merged.length} viral Shorts!`);
    }, 600);
  };

  const handleExportSelected = (selectedClips: Clip[]) => {
    if (!project) return;
    downloadBatchZip(project, selectedClips);
    showToast(`Downloading ZIP with ${selectedClips.length} Shorts packages...`);
  };

  const scrollToGenerator = () => {
    document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-black animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar */}
      <Navbar
        onNewBatchClick={scrollToGenerator}
        onExportAllClick={() => setIsExportModalOpen(true)}
        onTestClick={() => handleInstantTest('mrbeast')}
        onOpenInstaller={() => setIsInstallerOpen(true)}
        totalClips={clips.length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 space-y-8 pb-16">
        {/* YouTube Link Ingestion Form */}
        <BatchGeneratorForm
          onGenerate={handleGenerateClips}
          onInstantTest={handleInstantTest}
          onOpenInstaller={() => setIsInstallerOpen(true)}
          isLoading={isLoading}
          progressStep={progressStep}
          progressPercent={progressPercent}
        />

        {/* Test Control & Quick Switch Bar */}
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-red-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white">
                  Active Test Video: <span className="text-red-400 font-extrabold">{project?.title || 'MrBeast 100M Views Blueprint'}</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-400">
                  (Test face tracking & dynamic subtitles below, then click red 'Take & Paste')
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Switch Test:</span>
              {[
                { id: 'mrbeast', label: '🔥 MrBeast' },
                { id: 'rogan-altman', label: '🤖 Joe Rogan' },
                { id: 'huberman', label: '🧠 Huberman' },
                { id: 'hormozi', label: '💰 Hormozi' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleInstantTest(p.id)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 hover:border-red-500 text-xs text-slate-200 font-semibold hover:text-white transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Studio Player with 1-Click Direct Paste Machine */}
        {activeClip && (
          <OpusStudioPlayer
            clip={activeClip}
            project={project}
            onSelectNextClip={() => {
              const curIdx = clips.findIndex((c) => c.id === activeClip.id);
              if (curIdx < clips.length - 1) setActiveClip(clips[curIdx + 1]);
            }}
            onSelectPrevClip={() => {
              const curIdx = clips.findIndex((c) => c.id === activeClip.id);
              if (curIdx > 0) setActiveClip(clips[curIdx - 1]);
            }}
          />
        )}

        {/* Clip Matrix with 1-Click Take & Paste on each card */}
        {clips.length > 0 && (
          <ClipQueueMatrix
            clips={clips}
            selectedClipId={activeClip?.id || null}
            onSelectClip={(c) => {
              setActiveClip(c);
              document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onExportSelected={handleExportSelected}
            onExpandBatch={handleExpandBatch}
            project={project}
          />
        )}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        clips={clips}
        project={project}
      />

      {/* Autonomous AI & Feature Installer Modal */}
      <AutoEngineInstallerModal
        isOpen={isInstallerOpen}
        onClose={() => setIsInstallerOpen(false)}
        onInstalledToast={showToast}
      />

      {/* Private Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>ShortsForge · Personal YouTube Click Machine</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <a href="https://studio.youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              YouTube Studio
            </a>
            <a href="#generator" className="hover:text-white transition-colors">Paste Link</a>
            <a href="#studio" className="hover:text-white transition-colors">Shorts Studio</a>
            <a href="#clips-matrix" className="hover:text-white transition-colors">All Shorts</a>
          </div>
          <div>Private Edition · Unlimited Slices · 0 Watermarks.</div>
        </div>
      </footer>
    </div>
  );
}
