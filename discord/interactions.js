import { AudioPlayerStatus } from '@discordjs/voice';
import { MessageFlags } from 'discord.js';
import guilds from '../store.js';
import { addToQueue, addToQueueAsync, playNow, stop, pause, resume, skip, setVolume } from '../audio/player.js';
import { LOCALE } from '../config.js';
import locales from '../locale.js';

const t = locales[LOCALE] ?? locales.en;
import { getAISongSuggestion, getAISongQueue } from '../audio/ai.js';
import { getSongInfo } from '../audio/stream.js';
import {
  buildAddModal,
  buildAIPickModal,
  buildVibeModal,
  buildQueueEmbed,
  buildQueueJumpMenu,
  buildNeutralEmbed,
  buildErrorEmbed,
  buildAIPickEmbed,
  buildAIPickControls,
  buildVibeQueueEmbed,
  buildVibeQueueControls,
  buildSearchResultsEmbed,
  buildSearchResultsMenu,
  buildSearchCancelRow,
  buildControls,
} from './builders.js';

// ─── In-memory pending state ──────────────────────────────────────────────────

/** @type {Map<string, { prompt: string, query: string, voiceChannel: any, channel: any, requester: string }>} */
const pendingAI = new Map();

/** @type {Map<string, { prompt: string, queries: string[], voiceChannel: any, channel: any, requester: string }>} */
const pendingVibe = new Map();

/** @type {Map<string, { results: any[], voiceChannel: any, channel: any, requester: string }>} */
const pendingSearch = new Map();

// ─── Button handler ───────────────────────────────────────────────────────────

/** @param {import('discord.js').ButtonInteraction} interaction */
export async function handleButton(interaction) {
  const { customId, guildId, member, user } = interaction;

  try {
    switch (customId) {

      // ── Player controls ──────────────────────────────────────────────────
      case 'btn_pause_resume': {
        const state = guilds.get(guildId);
        if (state) {
          const isPaused = state.player.state.status === AudioPlayerStatus.Paused;
          isPaused ? resume(guildId) : pause(guildId);
        }
        await interaction.deferUpdate();
        break;
      }

      case 'btn_skip':
        skip(guildId);
        await interaction.deferUpdate();
        break;

      case 'btn_quit':
        stop(guildId);
        await interaction.deferUpdate();
        break;

      case 'btn_add_queue':
        if (!member.voice?.channel) {
          return interaction.reply({ content: t.joinVoiceFirst, flags: MessageFlags.Ephemeral });
        }
        await interaction.showModal(buildAddModal());
        break;

      // ── Show queue ───────────────────────────────────────────────────────
      case 'btn_show_queue': {
        const state = guilds.get(guildId);
        if (!state || state.queue.length === 0) {
          return interaction.reply({ embeds: [buildNeutralEmbed(t.queueEmptyShow)], flags: MessageFlags.Ephemeral });
        }
        const components = [];
        const jumpMenu = buildQueueJumpMenu(state.queue);
        if (jumpMenu) components.push(jumpMenu);
        await interaction.reply({
          embeds: [buildQueueEmbed(state.queue)],
          components,
          flags: MessageFlags.Ephemeral,
        });
        break;
      }

      // ── AI Pick button — opens modal for prompt input ────────────────────
      case 'btn_ai_pick':
        if (!member.voice?.channel) {
          return interaction.reply({ content: t.joinVoiceFirst, flags: MessageFlags.Ephemeral });
        }
        await interaction.showModal(buildAIPickModal());
        break;

      // ── Vibe button — opens modal for prompt + count ─────────────────────
      case 'btn_vibe':
        if (!member.voice?.channel) {
          return interaction.reply({ content: t.joinVoiceFirst, flags: MessageFlags.Ephemeral });
        }
        await interaction.showModal(buildVibeModal());
        break;

      // ── Search cancel ────────────────────────────────────────────────────
      case 'btn_search_cancel':
        pendingSearch.delete(user.id);
        await interaction.update({ content: t.searchCancelled, embeds: [], components: [] });
        break;

      // ── AI confirm ───────────────────────────────────────────────────────
      case 'btn_ai_confirm': {
        const pending = pendingAI.get(user.id);
        if (!pending) return interaction.update({ content: t.sessionExpired, embeds: [], components: [] });
        pendingAI.delete(user.id);
        await interaction.update({ content: t.addingToQueue(pending.query), embeds: [], components: [] });
        addToQueue(pending.voiceChannel, pending.query, pending.channel, pending.requester);
        break;
      }

      // ── AI reroll ────────────────────────────────────────────────────────
      case 'btn_ai_reroll': {
        const pending = pendingAI.get(user.id);
        if (!pending) return interaction.update({ content: t.sessionExpired, embeds: [], components: [] });
        await interaction.update({ content: t.rerolling, embeds: [], components: [] });
        let newQuery;
        try {
          newQuery = await getAISongSuggestion(pending.prompt);
        } catch {
          return interaction.editReply({ content: t.ollamaError, embeds: [], components: [] });
        }
        pending.query = newQuery;
        pendingAI.set(user.id, pending);
        await interaction.editReply({
          content: '',
          embeds: [buildAIPickEmbed(pending.prompt, newQuery)],
          components: [buildAIPickControls()],
        });
        break;
      }

      // ── AI cancel ────────────────────────────────────────────────────────
      case 'btn_ai_cancel':
        pendingAI.delete(user.id);
        await interaction.update({ content: t.cancelled, embeds: [], components: [] });
        break;

      // ── Vibe confirm ─────────────────────────────────────────────────────
      case 'btn_vibe_confirm': {
        const pending = pendingVibe.get(user.id);
        if (!pending) return interaction.update({ content: t.sessionExpired, embeds: [], components: [] });
        pendingVibe.delete(user.id);
        await interaction.update({ content: t.queuingN(pending.queries.length), embeds: [], components: [] });
        for (const query of pending.queries) {
          await addToQueueAsync(pending.voiceChannel, query, pending.channel, pending.requester);
        }
        break;
      }

      // ── Vibe reroll ──────────────────────────────────────────────────────
      case 'btn_vibe_reroll': {
        const pending = pendingVibe.get(user.id);
        if (!pending) return interaction.update({ content: t.sessionExpired, embeds: [], components: [] });
        await interaction.update({ content: t.rerollingVibe, embeds: [], components: [] });
        let newQueries;
        try {
          newQueries = await getAISongQueue(pending.prompt, pending.queries.length);
        } catch {
          return interaction.editReply({ content: t.ollamaError, embeds: [], components: [] });
        }
        pending.queries = newQueries;
        pendingVibe.set(user.id, pending);
        await interaction.editReply({
          content: '',
          embeds: [buildVibeQueueEmbed(pending.prompt, newQueries)],
          components: [buildVibeQueueControls()],
        });
        break;
      }

      // ── Vibe cancel ──────────────────────────────────────────────────────
      case 'btn_vibe_cancel':
        pendingVibe.delete(user.id);
        await interaction.update({ content: t.cancelled, embeds: [], components: [] });
        break;
    }
  } catch (err) {
    console.error('[button handler]', err);
  }
}

// ─── Select menu handler ──────────────────────────────────────────────────────

/** @param {import('discord.js').StringSelectMenuInteraction} interaction */
export async function handleSelectMenu(interaction) {
  const { customId, values, guildId, member, user } = interaction;

  try {
    switch (customId) {

      // ── Queue jump ───────────────────────────────────────────────────────
      case 'menu_queue_jump': {
        const index = parseInt(values[0].replace('jump_', ''), 10);
        const state = guilds.get(guildId);
        if (!state || index >= state.queue.length) {
          return interaction.reply({ content: t.songGone, flags: MessageFlags.Ephemeral });
        }
        const [song] = state.queue.splice(index, 1);
        state.queue.splice(1, 0, song);
        skip(guildId);
        await interaction.reply({ content: t.jumpingTo(song.title), flags: MessageFlags.Ephemeral });
        break;
      }

      // ── Search pick ──────────────────────────────────────────────────────
      case 'menu_search_pick': {
        const url = values[0];
        const pending = pendingSearch.get(user.id);
        if (!pending) return interaction.update({ content: t.sessionExpired, embeds: [], components: [] });
        pendingSearch.delete(user.id);
        const result = pending.results.find((r) => r.url === url);
        await interaction.update({ content: t.playing(result?.title ?? url), embeds: [], components: [] });
        await playNow(pending.voiceChannel, url, pending.channel, pending.requester);
        break;
      }
    }
  } catch (err) {
    console.error('[select menu handler]', err);
  }
}

// ─── Modal handler ────────────────────────────────────────────────────────────

/** @param {import('discord.js').ModalSubmitInteraction} interaction */
export async function handleModal(interaction) {
  const { customId, member, user, channel } = interaction;

  try {
    switch (customId) {

      // ── Add to queue ─────────────────────────────────────────────────────
      case 'modal_add_queue': {
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) {
          return interaction.reply({ content: t.joinVoiceFirst, flags: MessageFlags.Ephemeral });
        }
        const query     = interaction.fields.getTextInputValue('modal_query');
        const requester = `<@${user.id}>`;
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        addToQueue(voiceChannel, query, channel, requester);
        await interaction.deleteReply();
        break;
      }

      // ── AI Pick modal ────────────────────────────────────────────────────
      case 'modal_ai_pick': {
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) {
          return interaction.reply({ content: t.joinVoiceFirst, flags: MessageFlags.Ephemeral });
        }
        const prompt    = interaction.fields.getTextInputValue('modal_ai_prompt');
        const requester = `<@${user.id}>`;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let query;
        try {
          query = await getAISongSuggestion(prompt);
        } catch {
          return interaction.editReply({ content: t.ollamaErrorFull });
        }

        console.log(`[ai modal] "${prompt}" → "${query}"`);
        pendingAI.set(user.id, { prompt, query, voiceChannel, channel, requester });

        await interaction.editReply({
          embeds:     [buildAIPickEmbed(prompt, query)],
          components: [buildAIPickControls()],
        });
        break;
      }

      // ── Vibe modal ───────────────────────────────────────────────────────
      case 'modal_vibe': {
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) {
          return interaction.reply({ content: t.joinVoiceFirst, flags: MessageFlags.Ephemeral });
        }
        const prompt    = interaction.fields.getTextInputValue('modal_vibe_prompt');
        const countRaw  = interaction.fields.getTextInputValue('modal_vibe_count');
        const count     = Math.min(Math.max(parseInt(countRaw) || 5, 1), 10);
        const requester = `<@${user.id}>`;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        let queries;
        try {
          queries = await getAISongQueue(prompt, count);
        } catch {
          return interaction.editReply({ content: t.ollamaErrorFull });
        }

        if (!queries.length) {
          return interaction.editReply({ content: t.aiNoSongs });
        }

        console.log(`[vibe modal] "${prompt}" → ${queries.length} songs`);
        pendingVibe.set(user.id, { prompt, queries, voiceChannel, channel, requester });

        await interaction.editReply({
          embeds:     [buildVibeQueueEmbed(prompt, queries)],
          components: [buildVibeQueueControls()],
        });
        break;
      }
    }
  } catch (err) {
    console.error('[modal handler]', err);
  }
}

// ─── Slash command handler ────────────────────────────────────────────────────

/** @param {import('discord.js').ChatInputCommandInteraction} interaction */
export async function handleCommand(interaction) {
  // Guild-only — member or channel can be null in DMs
  if (!interaction.inGuild() || !interaction.member) {
    return interaction.reply({ content: '⚠️ This bot only works inside a server.', flags: MessageFlags.Ephemeral });
  }

  const { commandName, guildId, member, channel, user } = interaction;
  const requester = `<@${member.user.id}>`;

  try {
    switch (commandName) {

      // ── Play (search picker) ─────────────────────────────────────────────
      case 'p': {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!member.voice?.channel) return interaction.editReply({ content: t.joinVoiceFirst });
        const query = interaction.options.getString('query');
        if (query.startsWith('http')) {
          await playNow(member.voice.channel, query, channel, requester);
          return interaction.deleteReply();
        }
        let results;
        try {
          results = await getTopResults(query, 3);
        } catch {
          return interaction.editReply({ content: t.searchFailed });
        }
        if (!results.length) return interaction.editReply({ content: t.noResults });
        pendingSearch.set(user.id, { results, voiceChannel: member.voice.channel, channel, requester });
        await interaction.editReply({
          embeds:     [buildSearchResultsEmbed(results, query)],
          components: [buildSearchResultsMenu(results), buildSearchCancelRow()],
        });
        break;
      }

      // ── Add to queue ─────────────────────────────────────────────────────
      case 'a': {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!member.voice?.channel) return interaction.editReply({ content: t.joinVoiceFirst });
        addToQueue(member.voice.channel, interaction.options.getString('query'), channel, requester);
        await interaction.deleteReply();
        break;
      }

      // ── AI pick ──────────────────────────────────────────────────────────
      case 'ai': {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!member.voice?.channel) return interaction.editReply({ content: t.joinVoiceFirst });
        const prompt = interaction.options.getString('prompt');
        let query;
        try {
          query = await getAISongSuggestion(prompt);
        } catch {
          return interaction.editReply({ content: t.ollamaErrorFull });
        }
        console.log(`[ai] "${prompt}" → "${query}"`);
        pendingAI.set(user.id, { prompt, query, voiceChannel: member.voice.channel, channel, requester });
        await interaction.editReply({
          embeds:     [buildAIPickEmbed(prompt, query)],
          components: [buildAIPickControls()],
        });
        break;
      }

      // ── Vibe queue ───────────────────────────────────────────────────────
      case 'vibe': {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!member.voice?.channel) return interaction.editReply({ content: t.joinVoiceFirst });
        const prompt = interaction.options.getString('prompt');
        const count  = Math.min(interaction.options.getInteger('count') ?? 5, 10);
        let queries;
        try {
          queries = await getAISongQueue(prompt, count);
        } catch {
          return interaction.editReply({ content: t.ollamaErrorFull });
        }
        if (!queries.length) return interaction.editReply({ content: t.aiNoSongs });
        console.log(`[vibe] "${prompt}" → ${queries.length} songs`);
        pendingVibe.set(user.id, { prompt, queries, voiceChannel: member.voice.channel, channel, requester });
        await interaction.editReply({
          embeds:     [buildVibeQueueEmbed(prompt, queries)],
          components: [buildVibeQueueControls()],
        });
        break;
      }

      // ── Playback controls ─────────────────────────────────────────────────
      case 'q':
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        stop(guildId);
        await interaction.deleteReply();
        break;

      case 'st':
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        pause(guildId);
        await interaction.deleteReply();
        break;

      case 'res':
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        resume(guildId);
        await interaction.deleteReply();
        break;

      case 'sk':
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        skip(guildId);
        await interaction.deleteReply();
        break;

      case 'v': {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const percent = interaction.options.getInteger('percent');
        await setVolume(guildId, percent / 100);
        await interaction.deleteReply();
        break;
      }

      case 'ls': {
        await interaction.deferReply();
        const state = guilds.get(guildId);
        if (!state || state.queue.length === 0) {
          return interaction.editReply({ embeds: [buildNeutralEmbed(t.queueEmptyShow)] });
        }
        const components = [];
        const jumpMenu = buildQueueJumpMenu(state.queue);
        if (jumpMenu) components.push(jumpMenu);
        await interaction.editReply({ embeds: [buildQueueEmbed(state.queue)], components });
        break;
      }
    }
  } catch (err) {
    console.error('[command handler]', err);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch top N search results via yt-dlp.
 * @param {string} query
 * @param {number} count
 */
async function getTopResults(query, count = 3) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  const { YTDLP } = await import('../config.js');

  const { stdout } = await execAsync(
    `"${YTDLP}" "ytsearch${count}:${query}" --flat-playlist --get-id --get-title --get-duration --no-playlist`,
    { encoding: 'utf8' }
  );

  const lines = stdout.trim().split('\n').filter(Boolean);
  const results = [];

  // flat-playlist returns: title, id, duration interleaved — 3 lines per result
  for (let i = 0; i + 2 < lines.length; i += 3) {
    const title    = lines[i];
    const id       = lines[i + 1];
    const duration = lines[i + 2];
    if (id && id !== 'undefined') {
      results.push({
        title,
        url: `https://www.youtube.com/watch?v=${id}`,
        duration: duration || '??:??',
      });
    }
  }

  return results.slice(0, count);
}