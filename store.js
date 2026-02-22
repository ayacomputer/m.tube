/**
 * @typedef {Object} Song
 * @property {string} url
 * @property {string} title
 * @property {string} duration
 * @property {string} requester
 */

/**
 * @typedef {Object} GuildState
 * @property {import('@discordjs/voice').VoiceConnection} connection
 * @property {import('@discordjs/voice').AudioPlayer} player
 * @property {Song[]} queue
 * @property {number} volume        - multiplier, 0–2
 * @property {import('discord.js').TextChannel} textChannel
 * @property {NodeJS.ReadableStream | null} currentStream
 * @property {import('discord.js').Message | null} nowPlayingMessage
 * @property {NodeJS.Timeout | null} progressInterval
 * @property {number | null} playStartTime   - epoch ms when play started/resumed
 * @property {number} accumulatedMs          - ms elapsed before last pause
 */

/** @type {Map<string, GuildState>} */
const guilds = new Map();

export default guilds;
