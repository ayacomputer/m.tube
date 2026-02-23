import { SlashCommandBuilder } from 'discord.js';

export const COMMANDS = [
  new SlashCommandBuilder()
    .setName('p')
    .setDescription('Play a song immediately')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Song name or YouTube URL').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('a')
    .setDescription('Add a song to the end of the queue')
    .addStringOption((opt) =>
      opt.setName('query').setDescription('Song name or YouTube URL').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ai')
    .setDescription('Let AI pick a song based on your mood or vibe')
    .addStringOption((opt) =>
      opt.setName('prompt').setDescription('Describe a mood, activity, or vibe').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('vibe')
    .setDescription('Let AI queue up multiple songs for your vibe')
    .addStringOption((opt) =>
      opt.setName('prompt').setDescription('Describe a mood, activity, or vibe').setRequired(true)
    )
    .addIntegerOption((opt) =>
      opt.setName('count').setDescription('How many songs to queue (default: 5, max: 10)').setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('st')
    .setDescription('Pause the current song'),

  new SlashCommandBuilder()
    .setName('res')
    .setDescription('Resume the current song'),

  new SlashCommandBuilder()
    .setName('sk')
    .setDescription('Skip the current song'),

  new SlashCommandBuilder()
    .setName('v')
    .setDescription('Set the playback volume')
    .addIntegerOption((opt) =>
      opt.setName('percent').setDescription('Volume percentage (0–200)').setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('ls')
    .setDescription('Show the current queue'),

  new SlashCommandBuilder()
    .setName('q')
    .setDescription('Stop playback and leave the voice channel'),
].map((cmd) => cmd.toJSON());