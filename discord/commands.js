import { SlashCommandBuilder } from 'discord.js';
import { LOCALE } from '../config.js';
import locales from '../locale.js';

const t = locales[LOCALE] ?? locales.en;

export const COMMANDS = [
  new SlashCommandBuilder()
    .setName('p')
    .setDescription(t.cmdP)
    .addStringOption((opt) =>
      opt.setName('query').setDescription(t.cmdPQuery).setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('a')
    .setDescription(t.cmdA)
    .addStringOption((opt) =>
      opt.setName('query').setDescription(t.cmdAQuery).setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ai')
    .setDescription(t.cmdAI)
    .addStringOption((opt) =>
      opt.setName('prompt').setDescription(t.cmdAIPrompt).setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('vibe')
    .setDescription(t.cmdVibe)
    .addStringOption((opt) =>
      opt.setName('prompt').setDescription(t.cmdVibePrompt).setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName('count').setDescription(t.cmdVibeCount).setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('st')
    .setDescription(t.cmdSt),

  new SlashCommandBuilder()
    .setName('res')
    .setDescription(t.cmdRes),

  new SlashCommandBuilder()
    .setName('sk')
    .setDescription(t.cmdSk),

  new SlashCommandBuilder()
    .setName('v')
    .setDescription(t.cmdV)
    .addIntegerOption((opt) =>
      opt.setName('percent').setDescription(t.cmdVPercent).setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ls')
    .setDescription(t.cmdLs),

  new SlashCommandBuilder()
    .setName('q')
    .setDescription(t.cmdQ),
].map((cmd) => cmd.toJSON());