import { AudioPlayerStatus } from '@discordjs/voice';
import guilds from '../store.js';
import { addToQueue, playNow, stop, pause, resume, skip, setVolume } from '../audio/player.js';
import {
  buildAddModal,
  buildQueueEmbed,
  buildNeutralEmbed,
} from './builders.js';

// ─── Button handler ───────────────────────────────────────────────────────────

/** @param {import('discord.js').ButtonInteraction} interaction */
export async function handleButton(interaction) {
  const { customId, guildId, member } = interaction;

  try {
    switch (customId) {
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
          return interaction.reply({ content: 'Join a voice channel first!', ephemeral: true });
        }
        await interaction.showModal(buildAddModal());
        break;
    }
  } catch (err) {
    console.error('[button handler]', err);
  }
}

// ─── Modal handler ────────────────────────────────────────────────────────────

/** @param {import('discord.js').ModalSubmitInteraction} interaction */
export async function handleModal(interaction) {
  if (interaction.customId !== 'modal_add_queue') return;

  try {
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: 'Join a voice channel first!', ephemeral: true });
    }

    const query = interaction.fields.getTextInputValue('modal_query');
    const requester = `<@${interaction.user.id}>`;

    await interaction.deferReply({ ephemeral: true });
    addToQueue(voiceChannel, query, interaction.channel, requester);
    await interaction.deleteReply();
  } catch (err) {
    console.error('[modal handler]', err);
  }
}

// ─── Slash command handler ────────────────────────────────────────────────────

/** @param {import('discord.js').ChatInputCommandInteraction} interaction */
export async function handleCommand(interaction) {
  const { commandName, guildId, member, channel } = interaction;
  const requester = `<@${member.user.id}>`;

  try {
    switch (commandName) {
      case 'p': {
        await interaction.deferReply({ ephemeral: true });
        if (!member.voice.channel) return interaction.editReply({ content: 'Join a voice channel first!' });
        await playNow(member.voice.channel, interaction.options.getString('query'), channel, requester);
        await interaction.deleteReply();
        break;
      }

      case 'a': {
        await interaction.deferReply({ ephemeral: true });
        if (!member.voice.channel) return interaction.editReply({ content: 'Join a voice channel first!' });
        addToQueue(member.voice.channel, interaction.options.getString('query'), channel, requester);
        await interaction.deleteReply();
        break;
      }

      case 'q':
        await interaction.deferReply({ ephemeral: true });
        stop(guildId);
        await interaction.deleteReply();
        break;

      case 'st':
        await interaction.deferReply({ ephemeral: true });
        pause(guildId);
        await interaction.deleteReply();
        break;

      case 'res':
        await interaction.deferReply({ ephemeral: true });
        resume(guildId);
        await interaction.deleteReply();
        break;

      case 'sk':
        await interaction.deferReply({ ephemeral: true });
        skip(guildId);
        await interaction.deleteReply();
        break;

      case 'v': {
        await interaction.deferReply({ ephemeral: true });
        const percent = interaction.options.getInteger('percent');
        await setVolume(guildId, percent / 100);
        await interaction.deleteReply();
        break;
      }

      case 'ls': {
        await interaction.deferReply();
        const state = guilds.get(guildId);
        if (!state || state.queue.length === 0) {
          return interaction.editReply({ embeds: [buildNeutralEmbed('Queue is empty!')] });
        }
        await interaction.editReply({ embeds: [buildQueueEmbed(state.queue)] });
        break;
      }
    }
  } catch (err) {
    console.error('[command handler]', err);
  }
}
