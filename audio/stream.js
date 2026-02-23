import { spawn,  exec } from 'child_process';
import { promisify } from 'util';
import { YTDLP } from '../config.js';

const execAsync = promisify(exec);

/**
 * Fetch song metadata via yt-dlp, skipping age-restricted results.
 * @param {string} query - URL or search term
 * @param {string} [requester='Unknown']
 * @returns {Promise<import('../src/store.js').Song>}
 */
export async function getSongInfo(query, requester = 'Unknown') {
  const isUrl = query.startsWith('http');

  if (isUrl) {
    // Direct URL — no choice but to try it
    const { stdout } = await execAsync(
      `"${YTDLP}" "${query}" --get-id --get-title --get-duration --no-playlist`,
      { encoding: 'utf8' }
    );
    const [title, id, duration] = stdout.trim().split('\n');
    return {
      url: `https://www.youtube.com/watch?v=${id}`,
      title: title || query,
      duration: duration || '??:??',
      requester,
    };
  }

  // Search — try up to 5 results to skip any age-restricted ones
  const MAX_ATTEMPTS = 5;
  const { stdout } = await execAsync(
    `"${YTDLP}" "ytsearch${MAX_ATTEMPTS}:${query}" --flat-playlist --get-id --get-title --get-duration --no-playlist`,
    { encoding: 'utf8' }
  );

  const lines = stdout.trim().split('\n').filter(Boolean);

  // Results come back as interleaved: title, id, duration (3 lines per result)
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const title    = lines[i];
    const id       = lines[i + 1];
    const duration = lines[i + 2];

    if (!id || id === 'undefined') continue;

    // Quick age-restriction check — re-run get-id on this specific video
    try {
      await execAsync(
        `"${YTDLP}" "https://www.youtube.com/watch?v=${id}" --get-id --no-playlist --skip-download`,
        { encoding: 'utf8' }
      );
      // Passed — use this result
      return {
        url: `https://www.youtube.com/watch?v=${id}`,
        title: title || query,
        duration: duration || '??:??',
        requester,
      };
    } catch (err) {
      const msg = err.stderr || err.message || '';
      if (msg.includes('Sign in to confirm your age')) {
        console.warn(`[stream] Skipping age-restricted video: ${id} (${title})`);
        continue; // try the next result
      }
      throw err; // unexpected error — bubble up
    }
  }

  throw new Error(`No playable results found for "${query}" (all were age-restricted or unavailable).`);
}

/**
 * Spawn a yt-dlp → ffmpeg pipeline and return the readable stdout stream.
 * The returned stream has a `.cleanup()` method to kill both processes.
 *
 * @param {string} url
 * @param {number} [volume=1] - ffmpeg volume multiplier
 * @returns {NodeJS.ReadableStream & { cleanup: () => void }}
 */
export function createStream(url, volume = 1) {
  const ytdlp = spawn(YTDLP, [
    '-f', 'bestaudio[protocol^=http][abr>0]/bestaudio[protocol^=http]/bestaudio',
    '--no-playlist',
    '--no-part',
    '--extractor-args', 'youtube:skip=dash,hls',
    '-o', '-',
    url,
  ]);

  const ffmpeg = spawn('ffmpeg', [
    '-i', 'pipe:0',
    '-af', `volume=${volume}`,
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
    'pipe:1',
  ]);

  ytdlp.stdout.pipe(ffmpeg.stdin);

  // Swallow benign pipe errors
  ytdlp.stdout.on('error', () => {});
  ffmpeg.stdin.on('error', () => {});

  ytdlp.stderr.on('data', (chunk) => {
    const msg = chunk.toString();
    if (msg.includes('[info]') || msg.includes('ERROR') || msg.includes('WARNING')) {
      console.error('[yt-dlp]', msg.trim());
    }
  });

  ffmpeg.stderr.on('data', (chunk) => {
    const msg = chunk.toString();
    if (msg.includes('Error') || msg.includes('Invalid') || msg.includes('No such')) {
      console.error('[ffmpeg]', msg.trim());
    }
  });

  const stream = ffmpeg.stdout;

  stream.cleanup = () => {
    ytdlp.stdout.unpipe(ffmpeg.stdin);
    ytdlp.kill('SIGKILL');
    ffmpeg.kill('SIGKILL');
  };

  return stream;
}