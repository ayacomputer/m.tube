<div align="center">

<br>

# 📺 &nbsp; m . t u b e

<br>

*A clean, lightweight Discord music bot powered by `yt-dlp` and `ffmpeg`.*
*No bloated libraries. No nonsense. Just music.*

<br>

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=for-the-badge&logo=discord&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-FF0000?style=for-the-badge&logo=youtube&logoColor=white)
![ffmpeg](https://img.shields.io/badge/ffmpeg-any-007808?style=for-the-badge&logo=ffmpeg&logoColor=white)

![License](https://img.shields.io/badge/license-ISC-9B59B6?style=for-the-badge)
![Author](https://img.shields.io/badge/author-ayacomputer-00FF99?style=for-the-badge)
![Status](https://img.shields.io/badge/status-live-00FF99?style=for-the-badge&logo=statuspage&logoColor=white)

<br>

</div>

---

<div align="center">

### 🎵 &nbsp; Stream &nbsp;·&nbsp; Queue &nbsp;·&nbsp; Vibe

</div>

---

## ✨ &nbsp; Features

<br>

| &nbsp; | Feature | Description |
|--------|---------|-------------|
| 🎵 | **Direct YouTube streaming** | yt-dlp piped straight into ffmpeg — no third-party music libraries |
| 🖼️ | **playing card** | Thumbnail, live progress bar, status, and requester info |
| 🎛️ | **Button controls** | Pause, Resume, Skip, Add to Queue, Quit — right on the embed |
| ➕ | **Modal input** | Click "Add to Queue" for a popup — no slash command needed |
| 🔊 | **Volume control** | 0 to 200% with `/v` |
| 📋 | **Queue management** | View, add, skip |

---

## 🖼️ &nbsp; Now Playing Card

> The embed updates live every 5 seconds — Discord's minimum safe edit rate.

```
╭─────────────────────────────────────────────╮
│  🎵 Now Playing                             │
├─────────────────────────────────────────────┤
│                                             │
│  Daft Punk - Get Lucky                      │
│                                             │
│  ⏱ Progress                                 │
│  1:23  ▓▓▓▓▓▓░░░░░░░░░░░░  4:43             │
│  ▶️ Playing                                 │
│                                             │
│  👤 Requested by     ⏳ Duration            │
│  @user               4:43                   │
│                                             │
│  [⏸️ Pause] [⏭️ Skip] [➕ Queue] [🚪 Quit]  │
╰─────────────────────────────────────────────╯
```

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

</div>

---

## 🚀 &nbsp; Installation

<br>

### &nbsp; 1 &nbsp;·&nbsp; Clone the repo

```bash
git clone <your-repo-url>
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

### &nbsp; 5 &nbsp;·&nbsp; Run

```bash
npm start
```

---

## ☁️ &nbsp; Deploying to Oracle Cloud

<br>

### &nbsp; 1 &nbsp;·&nbsp; Upload your files

```bash
scp -r ./m.tube ubuntu@<your-server-ip>:~/m.tube
```

### &nbsp; 2 &nbsp;·&nbsp; Install dependencies on the server

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg

# yt-dlp
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
  -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

### &nbsp; 3 &nbsp;·&nbsp; Start with PM2

[PM2](https://pm2.keymetrics.io/) keeps m.tube running in the background and restarts it automatically on crash or reboot.

```bash
sudo npm install -g pm2
cd ~/m.tube && npm install
pm2 start bot.js --name m.tube
pm2 startup && pm2 save
```

<br>

> **PM2 quick reference**

| Command | Description |
|---------|-------------|
| `pm2 logs m.tube` | View live logs |
| `pm2 restart m.tube` | Restart the bot |
| `pm2 stop m.tube` | Stop the bot |
| `pm2 status` | Check running status |

---

## 🎮 &nbsp; Commands

> All commands are slash commands. Most can also be triggered via the **buttons on the now playing card**.

<br>

| Command | Description |
|---------|-------------|
| `/p <query>` | Play a song immediately — replaces current song, keeps queue |
| `/a <query>` | Add a song to the end of the queue without interrupting |
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

---

## ⚙️ &nbsp; How It Works

> m.tube streams audio by piping `yt-dlp` output directly into `ffmpeg`, which converts it to raw PCM for Discord's voice API — **no intermediate files, no caching**.

<br>

| Behaviour | Details |
|-----------|---------|
| `/p` vs `/a` | `/p` replaces the current song but leaves the rest of the queue intact. `/a` and ➕ Add to Queue are fully non-blocking — the current song never stutters while searching. |
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

<br>

</div>