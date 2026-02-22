/** @type {import('discord.js').ApplicationCommandData[]} */
export const COMMANDS = [
  {
    name: 'p',
    description: 'Play a song immediately, replacing current song but keeping queue',
    options: [{ name: 'query', type: 3, description: 'Song name or URL', required: true }],
  },
  {
    name: 'a',
    description: 'Add a song to the end of the queue without interrupting',
    options: [{ name: 'query', type: 3, description: 'Song name or URL', required: true }],
  },
  {
    name: 'q',
    description: 'Kill the session and leave the voice channel',
  },
  {
    name: 'st',
    description: 'Pause the current song',
  },
  {
    name: 'res',
    description: 'Resume the paused song',
  },
  {
    name: 'sk',
    description: 'Skip the current song',
  },
  {
    name: 'v',
    description: 'Set the volume (0 to 200%)',
    options: [{ name: 'percent', type: 4, description: 'Volume percent (0-200)', required: true }],
  },
  {
    name: 'ls',
    description: 'List the current queue',
  },
];
