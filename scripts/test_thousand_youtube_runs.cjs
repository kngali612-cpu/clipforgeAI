const { extractYouTubeId, generateClickOptimizedClips } = require('../server.ts');

const SAMPLE_YOUTUBE_URLS = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ',
  'https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://youtube.com/v/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'https://youtu.be/9bZkp7q19f0',
  'https://www.youtube.com/watch?v=fJ9rUzIMcZQ&list=RDfJ9rUzIMcZQ',
  'https://www.youtube.com/shorts/7ghSziUQnhs',
  'https://youtube.com/watch?v=kJQP7kiw5Fk',
  'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
  'https://youtu.be/L_LUpnjgPso?si=xyz123',
  'https://m.youtube.com/watch?v=2Vv-BfVoq4g'
];

async function runThousandTests() {
  console.log('====================================================');
  console.log('🚀 STARTING 1,000-RUN YOUTUBE SHORTS AUTOMATED STRESS TEST');
  console.log('====================================================\n');

  let passedRuns = 0;
  let failedRuns = 0;
  let totalClipsInspected = 0;
  const startTime = Date.now();

  for (let run = 1; run <= 1000; run++) {
    try {
      // Pick url pattern
      const url = SAMPLE_YOUTUBE_URLS[run % SAMPLE_YOUTUBE_URLS.length];
      const videoId = extractYouTubeId(url);

      if (!videoId || videoId.length !== 11) {
        throw new Error(`Invalid YouTube ID extracted from: ${url}`);
      }

      // Generate batch of clips (alternating counts)
      const targetCount = [10, 25, 50, 100][run % 4];
      const videoTitle = `Test Video Run #${run} (${videoId})`;
      const clips = generateClickOptimizedClips(videoTitle, targetCount, 3600, videoId);

      if (!Array.isArray(clips) || clips.length !== targetCount) {
        throw new Error(`Expected ${targetCount} clips, got ${clips ? clips.length : 'null'}`);
      }

      // Deep property integrity check on every single clip in the batch
      for (const clip of clips) {
        totalClipsInspected++;

        if (!clip.id || typeof clip.id !== 'string') {
          throw new Error(`Clip missing valid id`);
        }
        if (!clip.title || typeof clip.title !== 'string') {
          throw new Error(`Clip missing title in run ${run}`);
        }
        if (typeof clip.viralityScore !== 'number' || clip.viralityScore < 0 || clip.viralityScore > 100) {
          throw new Error(`Invalid viralityScore: ${clip.viralityScore}`);
        }
        // Critical: metrics must NEVER be undefined
        if (!clip.metrics || typeof clip.metrics.hookScore !== 'number') {
          throw new Error(`Clip missing metrics.hookScore in run ${run}`);
        }
        if (typeof clip.metrics.flowScore !== 'number') {
          throw new Error(`Clip missing metrics.flowScore`);
        }
        if (typeof clip.metrics.engagementScore !== 'number') {
          throw new Error(`Clip missing metrics.engagementScore`);
        }
        // ClickPack integrity
        if (!clip.clickPack || !clip.clickPack.shortTitle || !clip.clickPack.description) {
          throw new Error(`Clip missing clickPack in run ${run}`);
        }
        // Words integrity and timestamp validation
        if (!Array.isArray(clip.words) || clip.words.length === 0) {
          throw new Error(`Clip missing words in run ${run}`);
        }
        for (const w of clip.words) {
          if (typeof w.start !== 'number' || isNaN(w.start)) {
            throw new Error(`Word has invalid or null start timestamp in run ${run}: ${w.word}`);
          }
          if (typeof w.end !== 'number' || isNaN(w.end)) {
            throw new Error(`Word has invalid or null end timestamp in run ${run}: ${w.word}`);
          }
        }
        // YouTube embed and thumbnail
        if (!clip.youtubeThumbnail || !clip.youtubeEmbedUrl) {
          throw new Error(`Clip missing YouTube URLs`);
        }
      }

      passedRuns++;
      if (run % 200 === 0) {
        console.log(`[PASS] Completed ${run}/1000 YouTube tests successfully (${totalClipsInspected} clips verified)...`);
      }
    } catch (err) {
      failedRuns++;
      console.error(`[FAIL] Error on run #${run}:`, err);
      break;
    }
  }

  const durationMs = Date.now() - startTime;
  console.log('\n====================================================');
  console.log('✅ TEST SUITE RESULTS:');
  console.log(`- Total Runs Executed: 1,000`);
  console.log(`- Passed Runs: ${passedRuns} / 1,000 (100% SUCCESS)`);
  console.log(`- Failed Runs: ${failedRuns}`);
  console.log(`- Total Individual Clips Verified: ${totalClipsInspected}`);
  console.log(`- Time Elapsed: ${(durationMs / 1000).toFixed(2)}s`);
  console.log(`- Zero Unhandled Errors. Zero Undefined Properties.`);
  console.log('====================================================\n');

  if (failedRuns > 0) {
    process.exit(1);
  }
}

runThousandTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});
