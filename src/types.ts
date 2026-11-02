export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  emoji?: string;
  isFiller?: boolean;
}

export interface ClipMetrics {
  hookScore: number;
  flowScore: number;
  engagementScore: number;
  shareabilityScore: number;
}

export interface ClipSocialCopy {
  tiktok: string;
  instagram: string;
  youtube: string;
  x: string;
}

export interface ClickPack {
  shortTitle: string;
  description: string;
  firstSentenceHook: string;
  pinnedComment: string;
  hashtags: string;
}

export type AspectRatioType = '9:16' | '1:1' | '16:9';
export type CaptionPresetType = 'hormozi' | 'mrbeast' | 'aliabdaal' | 'cyber' | 'minimal';
export type FaceTrackingMode = 'auto-speaker' | 'split-screen' | 'pip-bubble' | 'blur-fill' | 'original-crop';

export interface Clip {
  id: string;
  index: number;
  title: string;
  hookHeadline: string; // Top banner hook
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  viralityReason: string;
  metrics: ClipMetrics;
  tags: string[];
  captionSummary: string;
  socialCopy: ClipSocialCopy;
  clickPack: ClickPack;
  words: WordTimestamp[];
  aspectRatio: AspectRatioType;
  speaker: string;
  activeFaceTracking: FaceTrackingMode;
  youtubeId?: string;
  youtubeThumbnail?: string;
  youtubeEmbedUrl?: string;
  bRollKeyword?: string;
}

export interface VideoProject {
  title: string;
  url: string;
  youtubeId?: string;
  thumbnailUrl?: string;
  channelName?: string;
  sourceStreamUrl: string;
  duration: number;
  speaker: string;
  totalClipsGenerated: number;
  aspectRatio: AspectRatioType;
  captionPreset: CaptionPresetType;
  faceTrackingMode: FaceTrackingMode;
  processedAt: string;
}
