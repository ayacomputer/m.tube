import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { AudioPlayerStatus } from '@discordjs/voice';
import { COLORS } from '../config.js';
import { formatDuration, parseDurationToSeconds, buildProgressBar, getThumbnail } from '../utils/format.js';
import { getElapsedMs } from '../utils/elapsed.js';

// ─── Embeds ──────────────────────────────────────────────────────────────────

/**
 * @param {import('../store.js').Song} song
 * @param {import('../store.js').GuildState} state
 */
export function buildNowPlayingEmbed(song, state) {
  const totalSecs = parseDurationToSeconds(song.duration);
  const elapsedSecs = Math.floor(getElapsedMs(state) / 1000);
  const bar = buildProgressBar(elapsedSecs, totalSecs);
  const thumbnail = getThumbnail(song.url);
  const paused = state.player.state.status === AudioPlayerStatus.Paused;

  const embed = new EmbedBuilder()
    .setColor(COLORS.nowPlaying)
    .setTitle('🎵 Now Playing')
    .setDescription(`### [${song.title}](${song.url})`)
    .addFields(
      {
        name: '⏱ Progress',
        value: `\`${formatDuration(elapsedSecs)}\` \`${bar}\` \`${song.duration}\`\n${paused ? '⏸️ **Paused**' : '▶️ Playing'}`,
        inline: false,
      },
      { name: '👤 Requested by', value: song.requester, inline: true },
      { name: '⏳ Duration',     value: `\`${song.duration}\``,    inline: true },
    )
    .setFooter({ text: '▐ m.tube' })
    .setTimestamp();

  if (thumbnail) embed.setThumbnail(thumbnail);
  return embed;
}

/** @param {import('../store.js').Song[]} queue */
export function buildQueueEmbed(queue) {
  const list = queue
    .map((s, i) =>
      `${i === 0 ? '🔊' : `**${i}.**`} [${s.title}](${s.url}) \`[${s.duration}]\` — ${s.requester}`
    )
    .join('\n') || 'Empty';

  return new EmbedBuilder()
    .setColor(COLORS.queue)
    .setTitle('📋 Queue')
    .setDescription(list)
    .setFooter({ text: `${queue.length} song(s) in queue • m.tube` })
    .setTimestamp();
}

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

// ─── Components ───────────────────────────────────────────────────────────────

/** @param {boolean} [paused=false] */
export function buildControls(paused = false) {
  return new ActionRowBuilder().addComponents(
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
      .setLabel('➕ Add to Queue')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_quit')
      .setLabel('🚪 Quit')
      .setStyle(ButtonStyle.Danger),
  );
}

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
