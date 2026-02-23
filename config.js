export const YTDLP = process.env.YTDLP_PATH || '/usr/local/bin/yt-dlp';

export const COLORS = {
  nowPlaying: 0x9B59B6,
  added:      0x00FF99,
  queue:      0x7D3C98,
  error:      0xFF4D6D,
  neutral:    0x2C2F33,
};

export const PROGRESS_INTERVAL_MS = 5_000;
export const MAX_VOLUME = 2;
export const MIN_VOLUME = 0;
export const VOICE_READY_TIMEOUT_MS = 30_000;
export const LOCALE = 'ja';