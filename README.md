# m.tube — Discord Music Bot

## Project structure

```
src/
├── index.js                  # Entry point — client setup, event wiring
├── config.js                 # Constants & env vars
├── store.js                  # Guild state map + JSDoc types
│
├── audio/
│   ├── stream.js             # yt-dlp + ffmpeg pipeline, getSongInfo()
│   ├── player.js             # playNext, addToQueue, playNow, stop, pause, resume, skip, setVolume
│   └── progress.js           # Periodic now-playing embed updater
│
├── discord/
│   ├── builders.js           # Embed + component factory functions
│   ├── commands.js           # Slash command definitions array
│   └── interactions.js       # handleButton, handleModal, handleCommand
│
└── utils/
    ├── elapsed.js            # Elapsed-time tracking helpers
    └── format.js             # Duration formatting, progress bar, thumbnail URL
```

## Setup

```bash
cp .env.example .env   # fill in DISCORD_TOKEN and optionally YTDLP_PATH
npm install
npm start
```

## Environment variables

| Variable      | Default                  | Description                        |
|---------------|--------------------------|------------------------------------|
| DISCORD_TOKEN | —                        | Your bot token (required)          |
| YTDLP_PATH    | `/usr/local/bin/yt-dlp`  | Path to the yt-dlp binary          |

## Commands

| Command            | Description                                          |
|--------------------|------------------------------------------------------|
| `/p <query>`       | Play immediately, replacing the current song         |
| `/a <query>`       | Add to the end of the queue                          |
| `/sk`              | Skip the current song                                |
| `/st`              | Pause                                                |
| `/res`             | Resume                                               |
| `/v <0-200>`       | Set volume (%)                                       |
| `/ls`              | Show the queue                                       |
| `/q`               | Stop and leave the voice channel                     |
