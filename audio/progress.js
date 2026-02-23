import { AudioPlayerStatus } from '@discordjs/voice';
import { PROGRESS_INTERVAL_MS } from '../config.js';
import { buildNowPlayingEmbed, buildControls } from '../discord/builders.js';
import guilds from '../store.js';

/**
 * Start the periodic "now playing" embed refresh for a guild.
 * @param {string} guildId
 */
export function startProgressUpdater(guildId) {
  const state = guilds.get(guildId);
  if (!state) return;

  // Clear any existing interval before starting a new one
  if (state.progressInterval) {
    clearInterval(state.progressInterval);
    state.progressInterval = null;
  }

  const interval = setInterval(async () => {
    const s = guilds.get(guildId);

    // Stop if guild state is gone or queue is empty
    if (!s || !s.nowPlayingMessage || !s.queue.length) {
      clearInterval(interval);
      return;
    }

    // Don't update while paused — embed is already frozen
    if (s.player.state.status === AudioPlayerStatus.Paused) return;

    try {
      await s.nowPlayingMessage.edit({
        embeds: [buildNowPlayingEmbed(s.queue[0], s)],
        components: buildControls(false),
      });
    } catch (err) {
      // Message was deleted — stop updating
      if (err.code === 10008) {
        clearInterval(interval);
        return;
      }
      // Bot lost permissions — stop updating
      if (err.code === 50013) {
        clearInterval(interval);
        console.error('[progress] Missing permissions to edit now-playing message.');
        return;
      }
      // Transient Discord error (50027, rate limit, etc.) — keep trying
    }
  }, Math.max(1, PROGRESS_INTERVAL_MS));

  state.progressInterval = interval;
}

/**
 * Stop the progress updater for a guild, if running.
 * @param {string} guildId
 */
export function stopProgressUpdater(guildId) {
  const state = guilds.get(guildId);
  if (state?.progressInterval) {
    clearInterval(state.progressInterval);
    state.progressInterval = null;
  }
}