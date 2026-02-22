import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} from '@discordjs/voice';
import { MAX_VOLUME, MIN_VOLUME, VOICE_READY_TIMEOUT_MS } from '../config.js';
import guilds from '../store.js';
import { createStream, getSongInfo } from './stream.js';
import { startProgressUpdater, stopProgressUpdater } from './progress.js';
import { buildNowPlayingEmbed, buildControls, buildAddedEmbed, buildNeutralEmbed, buildErrorEmbed } from '../discord/builders.js';
import { resetElapsed, freezeElapsed, resumeElapsed } from '../utils/elapsed.js';

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Create a fresh AudioPlayer wired to advance the queue on idle.
 * @param {string} guildId
 * @param {import('discord.js').TextChannel} textChannel
 */
function makePlayer(guildId, textChannel) {
  const player = createAudioPlayer();

  player.on(AudioPlayerStatus.Idle, () => {
    const s = guilds.get(guildId);
    if (s) {
      s.queue.shift();
      playNext(guildId);
    }
  });

  player.on('error', (err) => {
    console.error('[player error]', err);
    textChannel.send({ embeds: [buildErrorEmbed(err.message)] });
  });

  return player;
}

/**
 * Build the initial guild state and join the voice channel.
 * @param {import('discord.js').VoiceBasedChannel} voiceChannel
 * @param {import('discord.js').TextChannel} textChannel
 * @returns {Promise<import('../src/store.js').GuildState>}
 */
async function initGuildState(voiceChannel, textChannel) {
  const guildId = voiceChannel.guild.id;

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  await entersState(connection, VoiceConnectionStatus.Ready, VOICE_READY_TIMEOUT_MS);

  const player = makePlayer(guildId, textChannel);
  connection.subscribe(player);

  const state = {
    connection,
    player,
    queue: [],
    volume: 1,
    textChannel,
    currentStream: null,
    nowPlayingMessage: null,
    progressInterval: null,
    playStartTime: null,
    accumulatedMs: 0,
  };

  guilds.set(guildId, state);
  return state;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Start playing the first song in the queue, or leave if it's empty.
 * @param {string} guildId
 */
export async function playNext(guildId) {
  const state = guilds.get(guildId);

  if (!state || state.queue.length === 0) {
    if (state) {
      stopProgressUpdater(guildId);
      state.textChannel.send({ embeds: [buildNeutralEmbed('Queue is empty, leaving! 👋')] });
      try { state.connection.destroy(); } catch { /* already destroyed */ }
      guilds.delete(guildId);
    }
    return;
  }

  const song = state.queue[0];
  stopProgressUpdater(guildId);
  state.currentStream?.cleanup?.();

  const stream = createStream(song.url, state.volume);
  state.currentStream = stream;
  resetElapsed(state);

  const resource = createAudioResource(stream, { inputType: StreamType.Raw });
  state.player.play(resource);

  try {
    const msg = await state.textChannel.send({
      embeds: [buildNowPlayingEmbed(song, state)],
      components: [buildControls(false)],
    });
    state.nowPlayingMessage = msg;
    startProgressUpdater(guildId);
  } catch (err) {
    console.error('[playNext] Failed to send now-playing embed:', err);
  }
}

/**
 * Add a song to the end of the queue. Starts playback if nothing is playing.
 * @param {import('discord.js').VoiceBasedChannel} voiceChannel
 * @param {string} query
 * @param {import('discord.js').TextChannel} textChannel
 * @param {string} requester
 */
export function addToQueue(voiceChannel, query, textChannel, requester) {
  const guildId = voiceChannel.guild.id;

  getSongInfo(query, requester)
    .then(async (song) => {
      let state = guilds.get(guildId);
      if (!state) state = await initGuildState(voiceChannel, textChannel);

      state.textChannel = textChannel;
      state.queue.push(song);

      if (state.queue.length === 1) {
        playNext(guildId);
      } else {
        textChannel.send({ embeds: [buildAddedEmbed(song)] });
      }
    })
    .catch((err) => {
      console.error('[addToQueue]', err);
      textChannel.send({ embeds: [buildErrorEmbed(err.message)] });
    });
}

/**
 * Play a song immediately, replacing the current song but preserving the rest of the queue.
 * @param {import('discord.js').VoiceBasedChannel} voiceChannel
 * @param {string} query
 * @param {import('discord.js').TextChannel} textChannel
 * @param {string} requester
 */
export async function playNow(voiceChannel, query, textChannel, requester) {
  const guildId = voiceChannel.guild.id;
  const song = await getSongInfo(query, requester);

  let state = guilds.get(guildId);
  if (!state) state = await initGuildState(voiceChannel, textChannel);

  state.textChannel = textChannel;
  stopProgressUpdater(guildId);
  state.currentStream?.cleanup?.();
  state.currentStream = null;

  // Replace current song slot (or push if queue is empty)
  if (state.queue.length > 0) {
    state.queue[0] = song;
  } else {
    state.queue.push(song);
  }

  // Re-wire Idle listener so skipping still works after playNow
  state.player.removeAllListeners(AudioPlayerStatus.Idle);
  state.player.on(AudioPlayerStatus.Idle, () => {
    const s = guilds.get(guildId);
    if (s) { s.queue.shift(); playNext(guildId); }
  });

  state.player.stop(true);
  playNext(guildId);
}

/**
 * Stop playback, clear the queue, destroy the voice connection.
 * @param {string} guildId
 * @returns {boolean} whether a session was active
 */
export function stop(guildId) {
  const state = guilds.get(guildId);
  if (!state) return false;

  stopProgressUpdater(guildId);
  state.currentStream?.cleanup?.();
  state.queue = [];

  try { state.player.stop(true); } catch { /* already stopped */ }
  try { state.connection.destroy(); } catch { /* already destroyed */ }

  guilds.delete(guildId);
  return true;
}

/**
 * Pause the current song.
 * @param {string} guildId
 * @returns {'paused' | 'already_paused' | 'nothing'}
 */
export function pause(guildId) {
  const state = guilds.get(guildId);
  if (!state) return 'nothing';
  if (state.player.state.status === AudioPlayerStatus.Paused) return 'already_paused';

  state.player.pause();
  freezeElapsed(state);

  state.nowPlayingMessage?.edit({
    embeds: [buildNowPlayingEmbed(state.queue[0], state)],
    components: [buildControls(true)],
  }).catch(() => {});

  return 'paused';
}

/**
 * Resume a paused song.
 * @param {string} guildId
 * @returns {'resumed' | 'not_paused' | 'nothing'}
 */
export function resume(guildId) {
  const state = guilds.get(guildId);
  if (!state) return 'nothing';
  if (state.player.state.status !== AudioPlayerStatus.Paused) return 'not_paused';

  state.player.unpause();
  resumeElapsed(state);

  state.nowPlayingMessage?.edit({
    embeds: [buildNowPlayingEmbed(state.queue[0], state)],
    components: [buildControls(false)],
  }).catch(() => {});

  return 'resumed';
}

/**
 * Skip the currently playing song.
 * @param {string} guildId
 */
export function skip(guildId) {
  const state = guilds.get(guildId);
  if (!state || state.queue.length === 0) return;

  stopProgressUpdater(guildId);
  state.currentStream?.cleanup?.();
  state.currentStream = null;
  state.queue.shift();

  playNext(guildId);
}

/**
 * Change the playback volume (re-streams the current song at the new level).
 * @param {string} guildId
 * @param {number} volume - multiplier, 0–2
 */
export async function setVolume(guildId, volume) {
  const state = guilds.get(guildId);
  if (!state || state.queue.length === 0) return;

  state.volume = Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, volume));
  stopProgressUpdater(guildId);
  state.currentStream?.cleanup?.();

  const song = state.queue[0];
  const stream = createStream(song.url, state.volume);
  state.currentStream = stream;
  resetElapsed(state);

  const resource = createAudioResource(stream, { inputType: StreamType.Raw });
  state.player.play(resource);

  state.nowPlayingMessage?.edit({
    embeds: [buildNowPlayingEmbed(song, state)],
    components: [buildControls(false)],
  }).catch(() => {});

  startProgressUpdater(guildId);
}
