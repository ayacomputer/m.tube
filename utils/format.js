/**
 * Format seconds into a human-readable duration string.
 * @param {number} seconds
 * @returns {string} e.g. "3:04" or "1:02:34"
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/**
 * Parse a "HH:MM:SS" or "MM:SS" duration string into total seconds.
 * @param {string} duration
 * @returns {number}
 */
export function parseDurationToSeconds(duration) {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/**
 * Build a Unicode block progress bar.
 * @param {number} elapsedSecs
 * @param {number} totalSecs
 * @param {number} [length=18]
 * @returns {string}
 */
export function buildProgressBar(elapsedSecs, totalSecs, length = 18) {
  const progress = totalSecs > 0 ? Math.min(elapsedSecs / totalSecs, 1) : 0;
  const filled = Math.round(progress * length);
  return '▓'.repeat(filled) + '░'.repeat(length - filled);
}

/**
 * Extract a YouTube video ID and return the thumbnail URL.
 * @param {string} url
 * @returns {string | null}
 */
export function getThumbnail(url) {
  const match = url.match(/v=([^&]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
}

/** @param {number} n */
function pad(n) {
  return n.toString().padStart(2, '0');
}
