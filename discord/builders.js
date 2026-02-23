import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { COLORS, LOCALE } from '../config.js';
import locales from '../locale.js';

import { formatDuration, parseDurationToSeconds, buildProgressBar, getThumbnail } from '../utils/format.js';
import { getElapsedMs } from '../utils/elapsed.js';

const t = locales[LOCALE] ?? locales.en;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQueueEmoji(index) {
  const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
  return emojis[index - 1] || '🎵';
}

// ─── Now Playing ──────────────────────────────────────────────────────────────

/**
 * @param {import('../store.js').Song} song
 * @param {import('../store.js').GuildState} state
 */
export function buildNowPlayingEmbed(song, state) {
  const totalSecs   = parseDurationToSeconds(song.duration);
  const elapsedSecs = Math.floor(getElapsedMs(state) / 1000);
  const bar         = buildProgressBar(elapsedSecs, totalSecs);
  const thumbnail   = getThumbnail(song.url);
  const paused      = state.player.state.status === AudioPlayerStatus.Paused;

  const totalStr   = song.duration;
  const elapsedStr = formatDuration(elapsedSecs).padStart(totalStr.length, ' ');

  const embed = new EmbedBuilder()
    .setColor(COLORS.nowPlaying)
    .setTitle(t.nowPlayingTitle)
    .setDescription(`### [${song.title}](${song.url})\n\`${'─'.repeat(40)}\``)
    .addFields(
      {
        name: t.nowPlayingFieldProgress,
        value: `\`${elapsedStr}\` \`${bar}\` \`${totalStr}\`\n${paused ? t.nowPlayingPaused : t.nowPlayingPlaying}`,
        inline: false,
      },
      { name: t.nowPlayingFieldReq, value: song.requester,                   inline: true },
      { name: t.nowPlayingFieldDur,     value: `\`${song.duration}\``,           inline: true },
      { name: t.nowPlayingFieldLink,    value: `[${t.nowPlayingLinkLabel}](${song.url})`, inline: true },
    )
    .setFooter({ text: t.footer })
    .setTimestamp();

  if (thumbnail) embed.setThumbnail(thumbnail);
  return embed;
}

/**
 * Main player controls — two rows to fit all buttons.
 * Row 1: playback controls
 * Row 2: queue + AI
 * @param {boolean} [paused=false]
 */
export function buildControls(paused = false) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_pause_resume')
      .setLabel(paused ? t.btnResume : t.btnPause)
      .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_skip')
      .setLabel(t.btnSkip)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_add_queue')
      .setLabel(t.btnAdd)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_show_queue')
      .setLabel(t.btnQueue)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_quit')
      .setLabel(t.btnQuit)
      .setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_ai_pick')
      .setLabel(t.btnAIPick)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_vibe')
      .setLabel(t.btnVibe)
      .setStyle(ButtonStyle.Primary),
  );

  return [row1, row2];
}

/**
 * Queue jump select menu — lets user skip to any queued song.
 * Returns null if queue has fewer than 2 songs.
 * @param {import('../store.js').Song[]} queue
 */
export function buildQueueJumpMenu(queue) {
  if (queue.length < 2) return null;

  const options = queue.slice(1, 26).map((song, i) => ({
    label: song.title.slice(0, 100),
    description: t.queueJumpDesc(song.duration, song.requester.replace(/<@!?(\d+)>/, 'user')),
    value: `jump_${i + 1}`,
    emoji: getQueueEmoji(i + 1),
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('menu_queue_jump')
    .setPlaceholder(t.queueJumpPlaceholder)
    .addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

// ─── Queue ────────────────────────────────────────────────────────────────────

/** @param {import('../store.js').Song[]} queue */
export function buildQueueEmbed(queue) {
  const list = queue
    .map((s, i) => {
      const num = i === 0 ? t.queueNow : `\`${i}.\``;
      return `${num} [${s.title}](${s.url}) \`[${s.duration}]\` — ${s.requester}`;
    })
    .join('\n') || 'Empty';

  const totalDuration = queue.reduce((acc, s) => acc + parseDurationToSeconds(s.duration), 0);

  return new EmbedBuilder()
    .setColor(COLORS.queue)
    .setTitle(t.queueTitle)
    .setDescription(list)
    .addFields({
      name: '​',
      value: t.queueSummary(queue.length, formatDuration(totalDuration)),
      inline: false,
    })
    .setFooter({ text: t.footer })
    .setTimestamp();
}

// ─── Search results picker ────────────────────────────────────────────────────

/**
 * @param {{ title: string, url: string, duration: string }[]} results
 * @param {string} query
 */
export function buildSearchResultsEmbed(results, query) {
  const list = results
    .map((r, i) => `${getQueueEmoji(i + 1)} [${r.title}](${r.url}) \`[${r.duration}]\``)
    .join('\n');

  return new EmbedBuilder()
    .setColor(COLORS.nowPlaying)
    .setTitle(t.searchTitle(query))
    .setDescription(list)
    .setFooter({ text: t.searchFooter });
}

/** @param {{ title: string, url: string, duration: string }[]} results */
export function buildSearchResultsMenu(results) {
  const options = results.map((r, i) => ({
    label: r.title.slice(0, 100),
    description: r.duration,
    value: r.url,
    emoji: getQueueEmoji(i + 1),
  }));

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('menu_search_pick')
      .setPlaceholder(t.searchPlaceholder)
      .addOptions(options)
  );
}

export function buildSearchCancelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_search_cancel')
      .setLabel(t.searchCancel)
      .setStyle(ButtonStyle.Secondary),
  );
}

// ─── AI song picker ───────────────────────────────────────────────────────────

/**
 * @param {string} prompt
 * @param {string} query
 */
export function buildAIPickEmbed(prompt, query) {
  return new EmbedBuilder()
    .setColor(0xb799ff)
    .setTitle(t.aiPickTitle)
    .setDescription(t.aiPickDesc(prompt, query))
    .setFooter({ text: t.aiPickFooter });
}

export function buildAIPickControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_ai_confirm')
      .setLabel(t.aiPickPlay)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('btn_ai_reroll')
      .setLabel(t.aiPickReroll)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_ai_cancel')
      .setLabel(t.aiPickCancel)
      .setStyle(ButtonStyle.Secondary),
  );
}

// ─── Vibe queue confirm ───────────────────────────────────────────────────────

/**
 * @param {string} prompt
 * @param {string[]} queries
 */
export function buildVibeQueueEmbed(prompt, queries) {
  const list = queries
    .map((q, i) => `${getQueueEmoji(i + 1)} ${q}`)
    .join('\n');

  return new EmbedBuilder()
    .setColor(0xb799ff)
    .setTitle(t.vibeTitle)
    .setDescription(t.vibeDesc(prompt, list))
    .setFooter({ text: t.vibeFooter });
}

export function buildVibeQueueControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_vibe_confirm')
      .setLabel(t.vibeConfirm)
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('btn_vibe_reroll')
      .setLabel(t.vibeReroll)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_vibe_cancel')
      .setLabel(t.vibeCancel)
      .setStyle(ButtonStyle.Secondary),
  );
}

// ─── AI prompt modals ─────────────────────────────────────────────────────────

export function buildAIPickModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_ai_pick')
    .setTitle(t.aiPickModalTitle);

  const input = new TextInputBuilder()
    .setCustomId('modal_ai_prompt')
    .setLabel(t.aiPickModalLabel)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t.aiPickModalPlaceholder)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

export function buildVibeModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_vibe')
    .setTitle(t.vibeModalTitle);

  const promptInput = new TextInputBuilder()
    .setCustomId('modal_vibe_prompt')
    .setLabel(t.vibeModalLabel)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t.vibeModalPlaceholder)
    .setRequired(true);

  const countInput = new TextInputBuilder()
    .setCustomId('modal_vibe_count')
    .setLabel(t.vibeModalCountLabel)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t.vibeModalCountPlaceholder)
    .setRequired(false);

  modal.addComponents(
    new ActionRowBuilder().addComponents(promptInput),
    new ActionRowBuilder().addComponents(countInput),
  );
  return modal;
}

// ─── Generic embeds ───────────────────────────────────────────────────────────

/** @param {import('../store.js').Song} song */
export function buildAddedEmbed(song) {
  return new EmbedBuilder()
    .setColor(COLORS.added)
    .setDescription(t.addedDesc(song.title, song.url, song.duration, song.requester));
}

/** @param {string} message */
export function buildErrorEmbed(message) {
  return new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${message}`);
}

/** @param {string} message */
export function buildNeutralEmbed(message) {
  return new EmbedBuilder().setColor(COLORS.neutral).setDescription(message);
}

// ─── Add to queue modal ───────────────────────────────────────────────────────

export function buildAddModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_add_queue')
    .setTitle(t.addModalTitle);

  const input = new TextInputBuilder()
    .setCustomId('modal_query')
    .setLabel(t.addModalLabel)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(t.addModalPlaceholder)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}