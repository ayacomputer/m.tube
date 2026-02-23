import libsodium from 'libsodium-wrappers';
import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { YTDLP } from './config.js';
import { COMMANDS } from './discord/commands.js';
import { handleButton, handleModal, handleCommand } from './discord/interactions.js';

await libsodium.ready;

// ─── Global error safety net ─────────────────────────────────────────────────
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err));
process.on('uncaughtException',  (err) => console.error('[uncaughtException]',  err));

// ─── Client ───────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once('clientReady', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`🎵 yt-dlp path: ${YTDLP}`);
  await client.application.commands.set(COMMANDS);
  console.log(`📋 Registered ${COMMANDS.length} slash commands`);
});

// ─── Interactions ─────────────────────────────────────────────────────────────
client.on('interactionCreate', (interaction) => {
  if (interaction.isButton())           return handleButton(interaction);
  if (interaction.isModalSubmit())      return handleModal(interaction);
  if (interaction.isChatInputCommand()) return handleCommand(interaction);
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
