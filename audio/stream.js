import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';
import { YTDLP } from '../config.js';

const execAsync = promisify(exec);

/**
 * Fetch song metadata via yt-dlp.
 * @param {string} query - URL or search term
 * @param {string} [requester='Unknown']
 * @returns {Promise<import('../src/store.js').Song>}
 */
export async function getSongInfo(query, requester = 'Unknown') {
  const searchQuery = query.startsWith('http') ? query : `ytsearch1:${query}`;
  const { stdout } = await execAsync(
    `"${YTDLP}" "${searchQuery}" --get-id --get-title --get-duration --no-playlist`,
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
    '-f', 'bestaudio',
    '--no-playlist',
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
    if (!msg.includes('[download]') && !msg.includes('ETA')) {
      console.error('[yt-dlp]', msg.trim());
    }
  });

  ffmpeg.stderr.on('data', (chunk) => {
    const msg = chunk.toString();
    if (!msg.startsWith('size=') && !msg.includes('bitrate=') && !msg.includes('speed=')) {
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
