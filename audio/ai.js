import ollama from 'ollama';

const SYSTEM_PROMPT = `You are a music recommendation assistant for a Discord music bot.
When given a mood, activity, or vibe description, respond with ONLY a YouTube search query for a single song.
No explanations. No punctuation at the end. No quotation marks. No artist labels.
Just the search query itself, like you would type into YouTube.

Examples:
User: something chill for late night coding
You: Nujabes Feather

User: hype song for working out
You: Eminem Till I Collapse

User: sad rainy day vibes
You: Bon Iver Holocene

User: happy summer road trip
You: Daft Punk Get Lucky`;

/**
 * Ask Ollama to suggest a song based on a natural language prompt.
 * @param {string} prompt - user's mood/vibe description
 * @param {string} [model='llama3'] - Ollama model to use
 * @returns {Promise<string>} - a YouTube search query
 */
export async function getAISongSuggestion(prompt, model = 'llama3') {
  const response = await ollama.chat({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: prompt },
    ],
  });

  return response.message.content.trim();
}

/**
 * Ask Ollama to suggest multiple songs based on a prompt.
 * @param {string} prompt - user's mood/vibe description
 * @param {number} count - how many songs to suggest
 * @param {string} [model='llama3'] - Ollama model to use
 * @returns {Promise<string[]>} - array of YouTube search queries
 */
export async function getAISongQueue(prompt, count = 5, model = 'llama3') {
  const response = await ollama.chat({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a music recommendation assistant for a Discord music bot.
When given a mood, activity, or vibe, respond with EXACTLY ${count} YouTube search queries, one per line.
No numbering. No explanations. No punctuation. No quotation marks. Just raw search queries.

Example for "chill late night":
Nujabes Feather
Tame Impala The Less I Know The Better
Mac Miller Small Worlds
Khruangbin Lady And Man
J Dilla Donuts`,
      },
      { role: 'user', content: prompt },
    ],
  });

  return response.message.content
  .trim()
  .split('\n')
  .map((line) => line.replace(/^[\d\.\-\*\s]+/, '').trim())  // strip "1. " "- " etc
  .filter(Boolean)
  .slice(0, count);

}