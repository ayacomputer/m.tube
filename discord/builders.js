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
import { COLORS } from '../config.js';
import { formatDuration, parseDurationToSeconds, buildProgressBar, getThumbnail } from '../utils/format.js';
import { getElapsedMs } from '../utils/elapsed.js';

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
    .setTitle('🎵 Now Playing')
    .setDescription(`### [${song.title}](${song.url})\n\`${'─'.repeat(40)}\``)
    .addFields(
      {
        name: '⏱ Progress',
        value: `\`${elapsedStr}\` \`${bar}\` \`${totalStr}\`\n${paused ? '⏸️ **Paused**' : '▶️ Playing'}`,
        inline: false,
      },
      { name: '👤 Requested by', value: song.requester,                   inline: true },
      { name: '⏳ Duration',     value: `\`${song.duration}\``,           inline: true },
      { name: '🔗 Link',         value: `[Open in YouTube](${song.url})`, inline: true },
    )
    .setFooter({ text: '▐ m.tube' })
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
      .setLabel(paused ? '▶️ Resume' : '⏸️ Pause')
      .setStyle(paused ? ButtonStyle.Success : ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_skip')
      .setLabel('⏭️ Skip')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_add_queue')
      .setLabel('➕ Add')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_show_queue')
      .setLabel('📋 Queue')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_quit')
      .setLabel('🚪 Quit')
      .setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_ai_pick')
      .setLabel('🤖 AI Pick')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_vibe')
      .setLabel('🎶 Vibe Queue')
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
    description: `${song.duration} · requested by ${song.requester.replace(/<@!?(\d+)>/, 'user')}`,
    value: `jump_${i + 1}`,
    emoji: getQueueEmoji(i + 1),
  }));

  const menu = new StringSelectMenuBuilder()
    .setCustomId('menu_queue_jump')
    .setPlaceholder('⏩ Jump to a song in the queue…')
    .addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

// ─── Queue ────────────────────────────────────────────────────────────────────

/** @param {import('../store.js').Song[]} queue */
export function buildQueueEmbed(queue) {
  const list = queue
    .map((s, i) => {
      const num = i === 0 ? '🔊 **Now**' : `\`${i}.\``;
      return `${num} [${s.title}](${s.url}) \`[${s.duration}]\` — ${s.requester}`;
    })
    .join('\n') || 'Empty';

  const totalDuration = queue.reduce((acc, s) => acc + parseDurationToSeconds(s.duration), 0);

  return new EmbedBuilder()
    .setColor(COLORS.queue)
    .setTitle('📋 Queue')
    .setDescription(list)
    .addFields({
      name: '​',
      value: `**${queue.length}** song${queue.length !== 1 ? 's' : ''} · Total: \`${formatDuration(totalDuration)}\``,
      inline: false,
    })
    .setFooter({ text: '▐ m.tube' })
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
    .setTitle(`🔍 Results for "${query}"`)
    .setDescription(list)
    .setFooter({ text: 'Pick a song below · m.tube' });
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
      .setPlaceholder('Choose a song to play…')
      .addOptions(options)
  );
}

export function buildSearchCancelRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_search_cancel')
      .setLabel('✖ Cancel')
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
    .setTitle('🤖 AI Pick')
    .setDescription(`**Prompt:** *${prompt}*\n\n🎵 **${query}**`)
    .setFooter({ text: 'Confirm to play · Reroll for a different pick · m.tube' });
}

export function buildAIPickControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_ai_confirm')
      .setLabel('✅ Play it')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('btn_ai_reroll')
      .setLabel('🎲 Reroll')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_ai_cancel')
      .setLabel('✖ Cancel')
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
    .setTitle('🎶 Vibe Queue')
    .setDescription(`**Prompt:** *${prompt}*\n\n${list}`)
    .setFooter({ text: 'Confirm to queue all · m.tube' });
}

export function buildVibeQueueControls() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_vibe_confirm')
      .setLabel('✅ Queue all')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('btn_vibe_reroll')
      .setLabel('🎲 Reroll')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('btn_vibe_cancel')
      .setLabel('✖ Cancel')
      .setStyle(ButtonStyle.Secondary),
  );
}

// ─── AI prompt modals ─────────────────────────────────────────────────────────

export function buildAIPickModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_ai_pick')
    .setTitle('🤖 AI Pick');

  const input = new TextInputBuilder()
    .setCustomId('modal_ai_prompt')
    .setLabel('Describe a mood, vibe, or activity')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. chill late night coding')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

export function buildVibeModal() {
  const modal = new ModalBuilder()
    .setCustomId('modal_vibe')
    .setTitle('🎶 Vibe Queue');

  const promptInput = new TextInputBuilder()
    .setCustomId('modal_vibe_prompt')
    .setLabel('Describe a mood, vibe, or activity')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. hype workout songs')
    .setRequired(true);

  const countInput = new TextInputBuilder()
    .setCustomId('modal_vibe_count')
    .setLabel('How many songs? (1–10, default 5)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('5')
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
    .setDescription(`✅ **[${song.title}](${song.url})** \`${song.duration}\` — ${song.requester}`);
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
    .setTitle('➕ Add to Queue');

  const input = new TextInputBuilder()
    .setCustomId('modal_query')
    .setLabel('Song name or YouTube URL')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('e.g. Daft Punk - Get Lucky')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}