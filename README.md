<div align="center">

<br>

# 📺 &nbsp; m . t u b e
## *A clean, lightweight Discord music bot powered by `yt-dlp`, `ffmpeg`, and local AI via Ollama.*


![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
![ffmpeg](https://img.shields.io/badge/ffmpeg-any-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-local%20AI-black?style=for-the-badge&logo=ollama&logoColor=white)

![License](https://img.shields.io/badge/license-ISC-9B59B6?style=for-the-badge)
![Author](https://img.shields.io/badge/author-ayacomputer-00FF99?style=for-the-badge)
![Status](https://img.shields.io/badge/status-live-00FF99?style=for-the-badge&logo=statuspage&logoColor=white)

<br>

</div>

---

<div align="center">

### 🎵 &nbsp; Stream &nbsp;·&nbsp; Queue &nbsp;·&nbsp; Vibe &nbsp;·&nbsp; 🤖 AI

</div>

---

## ✨ &nbsp; Features

<br>

| &nbsp; | Feature | Description |
|--------|---------|-------------|
| 🎵 | **Direct YouTube streaming** | yt-dlp piped straight into ffmpeg — no third-party music libraries |
| 🖼️ | **Rich now playing card** | Thumbnail, live progress bar, status, and requester info |
| 🎛️ | **Button controls** | Pause, Resume, Skip, Add to Queue, Quit — right on the embed |
| ➕ | **Modal input** | Click "Add to Queue" for a popup — no slash command needed |
| 🔊 | **Volume control** | 0 to 200% with `/v` |
| 📋 | **Queue management** | View, add, skip, and auto-advance |
| 🤖 | **AI song picks** | `/ai` uses a local Ollama model to suggest a song from your mood or vibe |
| 🎶 | **AI vibe queue** | `/vibe` generates a full playlist from a natural language prompt via Ollama |

---

## 🖼️ &nbsp; Now Playing Card

> The embed updates live every 5 seconds — Discord's minimum safe edit rate.

```
╭──────────────────────────────────────────────────────╮
│  🎵 Now Playing                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Daft Punk - Get Lucky                               │
│  ────────────────────────────────────────            │
│                                                      │
│  ⏱ Progress                                          │
│  1:23  ▓▓▓▓▓▓░░░░░░░░░░░░  4:43                      │
│  ▶️ Playing                                          │
│                                                      │
│  👤 Requested by   ⏳ Duration   🔗 Link             │
│  @user             4:43          Open in YouTube     │
│                                                      │
├──────────────────────────────────────────────────────┤
│  [⏸️ Pause] [⏭️ Skip] [➕ Add] [📋 Queue] [🚪 Quit]  │
|                                                      |
│  [🤖 AI Pick]  [🎶 Vibe Queue]                       │
╰──────────────────────────────────────────────────────╯
```

**Row 1 — Playback controls**

| Button | Action |
|--------|--------|
| ⏸️ Pause / ▶️ Resume | Toggle pause — embed updates instantly to reflect state |
| ⏭️ Skip | Skip to the next song in the queue |
| ➕ Add | Opens a modal — type any song name or YouTube URL |
| 📋 Queue | Shows the current queue with a jump-to menu (ephemeral) |
| 🚪 Quit | Stops playback and disconnects from the voice channel |

**Row 2 — AI controls**

| Button | Action |
|--------|--------|
| 🤖 AI Pick | Opens a prompt modal — Ollama suggests a single song to preview. Confirm to add to queue, Reroll for a new pick, or Cancel |
| 🎶 Vibe Queue | Opens a prompt modal with an optional song count — Ollama generates a full playlist to preview. Confirm to queue all, Reroll for a fresh set, or Cancel |

---

## 📦 &nbsp; Requirements

<br>

<div align="center">

| Requirement | Version |
|:-----------:|:-------:|
| ![Node](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white) | v18+ |
| ![ffmpeg](https://img.shields.io/badge/ffmpeg-required-007808?style=flat-square) | any recent |
| ![yt-dlp](https://img.shields.io/badge/yt--dlp-required-FF0000?style=flat-square) | latest |
| ![Discord](https://img.shields.io/badge/bot_token-required-5865F2?style=flat-square&logo=discord&logoColor=white) | — |
| ![Ollama](https://img.shields.io/badge/Ollama-optional-black?style=flat-square) | for `/ai` & `/vibe` |

</div>

---

## 🚀 &nbsp; Installation

<br>

### &nbsp; 1 &nbsp;·&nbsp; Clone the repo

```bash
git clone https://github.com/ayacomputer/m.tube.git
cd m.tube
```

### &nbsp; 2 &nbsp;·&nbsp; Install Node dependencies

```bash
npm install
```

### &nbsp; 3 &nbsp;·&nbsp; Install system dependencies

<details>
<summary>🍎 &nbsp; <b>macOS</b></summary>
<br>

```bash
brew install ffmpeg yt-dlp
```

</details>

<details>
<summary>🐧 &nbsp; <b>Linux (Ubuntu / Debian)</b></summary>
<br>

```bash
sudo apt install -y ffmpeg
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

</details>

<br>

### &nbsp; 4 &nbsp;·&nbsp; Configure environment

Create a `.env` file in the root directory:

```env
DISCORD_TOKEN=your_discord_bot_token_here
YTDLP_PATH=/opt/homebrew/bin/yt-dlp
```

| Variable | macOS | Linux |
|----------|-------|-------|
| `YTDLP_PATH` | `/opt/homebrew/bin/yt-dlp` | `/usr/local/bin/yt-dlp` |

### &nbsp; 5 &nbsp;·&nbsp; Install & configure Ollama *(optional — for `/ai` and `/vibe`)*

> Ollama runs LLMs locally on your machine. m.tube uses it to suggest songs from natural language prompts — no API key or internet connection required.

<details>
<summary>🍎 &nbsp; <b>macOS</b></summary>
<br>

```bash
brew install ollama
ollama pull llama3
ollama serve
```

</details>

<details>
<summary>🐧 &nbsp; <b>Linux</b></summary>
<br>

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3
ollama serve
```

</details>

<details>
<summary>🪟 &nbsp; <b>Windows</b></summary>
<br>

Download and run the installer from [ollama.com/download](https://ollama.com/download), then in a terminal:

```bash
ollama pull llama3
ollama serve
```

</details>

<br>

**⚙️ Changing the AI model**

m.tube defaults to `llama3`. You can swap it for any model you have pulled locally by editing `audio/ai.js`:

```js
// audio/ai.js
export async function getAISongSuggestion(prompt, model = 'llama3') {
```

Change `'llama3'` to any model you prefer, for example:

| Model | Pull command | Notes |
|-------|-------------|-------|
| `llama3` | `ollama pull llama3` | Default — good balance of speed and quality |
| `mistral` | `ollama pull mistral` | Faster, slightly smaller |
| `gemma` | `ollama pull gemma` | Google's lightweight model |
| `llama3:70b` | `ollama pull llama3:70b` | Best quality — needs a powerful machine |

<br>

> [!NOTE]
> Ollama must be running (`ollama serve`) whenever the bot is active for AI features to work. `/ai` and `/vibe` will return a friendly error message if Ollama is unreachable — the rest of the bot works fine without it.

### &nbsp; 6 &nbsp;·&nbsp; Run

```bash
npm start
```

---


## 🎮 &nbsp; Commands

> All commands are slash commands. Most can also be triggered via the **buttons on the now playing card**.

<br>

| Command | Description |
|---------|-------------|
| `/p <query>` | Play a song immediately — replaces current song, keeps queue |
| `/a <query>` | Add a song to the end of the queue without interrupting |
| `/ai <prompt>` | Let Ollama pick a song from your mood — preview before queuing |
| `/vibe <prompt> [count]` | Let Ollama generate a full playlist — preview before queuing all |
| `/st` | Pause the current song |
| `/res` | Resume a paused song |
| `/sk` | Skip the current song |
| `/v <0–200>` | Set the volume as a percentage |
| `/ls` | Show the current queue |
| `/q` | Stop playback and leave the voice channel |

<br>

### &nbsp; 🎛️ &nbsp; Button controls

| Button | Action |
|--------|--------|
| ⏸️ &nbsp; Pause / &nbsp; ▶️ &nbsp; Resume | Toggle pause and resume |
| ⏭️ &nbsp; Skip | Skip to the next song |
| ➕ &nbsp; Add to Queue | Opens a popup — type a song name or URL |
| 🚪 &nbsp; Quit | Stop playback and leave |
| 🤖 &nbsp; AI Pick | Opens a prompt modal — Ollama suggests a song to preview & queue |
| 🎶 &nbsp; Vibe Queue | Opens a prompt modal — Ollama generates a full playlist to preview & queue |

---

## ⚙️ &nbsp; How It Works

> m.tube streams audio by piping `yt-dlp` output directly into `ffmpeg`, which converts it to raw PCM for Discord's voice API — **no intermediate files, no caching**.

<br>

| Behaviour | Details |
|-----------|---------|
| `/p` vs `/a` | `/p` replaces the current song but leaves the rest of the queue intact. `/a` and ➕ Add to Queue are fully non-blocking — the current song never stutters while searching. |
| `/ai` & `/vibe` | Both show a preview embed (with Reroll and Cancel) before touching the queue. Confirming always uses `addToQueue` — the current song is **never interrupted**. |
| AI model | Defaults to `llama3` via Ollama. Change the model in `audio/ai.js` if you want to use a different one (e.g. `mistral`, `gemma`). |
| Progress bar | Updates every 5 seconds — Discord's minimum safe edit rate. |
| Pause / resume | Pausing freezes the elapsed timer precisely; resuming continues from the exact same point. |
| Volume | Volume changes restart the stream from the beginning (Discord limitation). |
| Auto-disconnect | m.tube leaves the voice channel automatically when the queue empties. |

---

## 🔧 &nbsp; Maintenance

> [!WARNING]
> **Keep yt-dlp updated regularly** — YouTube frequently changes their player and an outdated yt-dlp will break playback silently.

<details>
<summary>🍎 &nbsp; <b>macOS</b></summary>
<br>

```bash
brew upgrade yt-dlp
```

</details>

<details>
<summary>🐧 &nbsp; <b>Linux</b></summary>
<br>

```bash
sudo yt-dlp -U
```

</details>

---

<div align="center">

<br>

**📺 &nbsp; m . t u b e**

*ISC © ayacomputer &nbsp;·&nbsp; powered by yt-dlp & discord.js*

<br>

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-FF0000?style=flat-square)
![Ollama](https://img.shields.io/badge/Ollama-local%20AI-black?style=flat-square)

<br>

</div>