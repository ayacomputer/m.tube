/**
 * UI locale strings for m.tube.
 */

const locales = {
  ja: {
    // ── Embeds ──────────────────────────────────────────────────────────────
    nowPlayingTitle:        '🎵 再生中',
    nowPlayingPaused:       '⏸️ **一時停止中**',
    nowPlayingPlaying:      '▶️ 再生中',
    nowPlayingFieldProgress:'⏱ 進捗',
    nowPlayingFieldReq:     '👤 リクエスト',
    nowPlayingFieldDur:     '⏳ 再生時間',
    nowPlayingFieldLink:    '🔗 リンク',
    nowPlayingLinkLabel:    'YouTubeで開く',
    footer:                 '▐ m.tube',

    queueTitle:             '📋 予約リスト',
    queueNow:               '🔊 **再生中**',
    queueSummary:           (count, total) => `**${count}** 曲 · 合計: \`${total}\``,

    searchTitle:            (query) => `🔍「${query}」の検索結果`,
    searchFooter:           '下から曲を選んでください · m.tube',
    searchPlaceholder:      '再生する曲を選択…',
    searchCancel:           '✖ キャンセル',

    aiPickTitle:            '🤖 AIピック',
    aiPickDesc:             (prompt, query) => `**プロンプト:** *${prompt}*\n\n🎵 **${query}**`,
    aiPickFooter:           '確認で再生 · リロールで別の曲 · m.tube',
    aiPickPlay:             '✅ 再生する',
    aiPickReroll:           '🎲 リロール',
    aiPickCancel:           '✖ キャンセル',
    aiPickModalTitle:       '🤖 AIピック',
    aiPickModalLabel:       'ムード・活動・雰囲気を説明してください',
    aiPickModalPlaceholder: '例：深夜のまったりコーディング',

    vibeTitle:              '🎶 AI複数予約',
    vibeDesc:               (prompt, list) => `**プロンプト:** *${prompt}*\n\n${list}`,
    vibeFooter:             '確認で全曲をキューに追加 · m.tube',
    vibeConfirm:            '✅ 全曲追加',
    vibeReroll:             '🎲 リロール',
    vibeCancel:             '✖ キャンセル',
    vibeModalTitle:         '🎶 AI複数予約',
    vibeModalLabel:         'ムード・活動・雰囲気を説明してください',
    vibeModalPlaceholder:   '例：ワークアウトで盛り上がる曲',
    vibeModalCountLabel:    '曲数（1〜10、デフォルト5）',
    vibeModalCountPlaceholder: '5',

    addModalTitle:          '➕ 予約追加',
    addModalLabel:          '曲名またはYouTube URL',
    addModalPlaceholder:    '例：Daft Punk - Get Lucky',

    // ── Buttons ─────────────────────────────────────────────────────────────
    btnPause:               '⏸️ 一時停止',
    btnResume:              '▶️ 再開',
    btnSkip:                '⏭️ スキップ',
    btnAdd:                 '➕ 追加',
    btnQueue:               '📋 予約リスト',
    btnQuit:                '🚪 退出',
    btnAIPick:              '🤖 AIピック',
    btnVibe:                '🎶 AI複数予約',

    // ── Queue jump menu ─────────────────────────────────────────────────────
    queueJumpPlaceholder:   '⏩ 予約の曲にジャンプ…',
    queueJumpDesc:          (dur, req) => `${dur} · リクエスト: ${req}`,

    // ── Player messages ─────────────────────────────────────────────────────
    queueEmpty:             '予約はありません。退出します！ 👋',
    queueEmptyShow:         '予約はありません！',
    addedDesc:              (title, url, dur, req) => `✅ **[${title}](${url})** \`${dur}\` — ${req}`,

    // ── Interaction responses ────────────────────────────────────────────────
    joinVoiceFirst:         '🎤 先にボイスチャンネルに参加してください！',
    sessionExpired:         '⚠️ セッションが期限切れです。',
    searchCancelled:        '✖ 検索をキャンセルしました。',
    cancelled:              '✖ キャンセルしました。',
    rerolling:              '🎲 リロール中…',
    rerollingVibe:          '🎲 バイブをリロール中…',
    ollamaError:            '❌ Ollamaエラー。起動していますか？',
    ollamaErrorFull:        '❌ Ollamaに接続できません。起動していますか？ (`ollama serve`)',
    aiNoSongs:              '❌ AIが曲を返しませんでした。別のプロンプトをお試しください。',
    searchFailed:           '❌ 検索結果を取得できませんでした。',
    noResults:              '❌ 結果が見つかりませんでした。',
    songGone:               '⚠️ その曲はキューにもう存在しません。',
    jumpingTo:              (title) => `⏩ **${title}** にジャンプします`,
    addingToQueue:          (query) => `✅ **${query}** をキューに追加中…`,
    queuingN:               (n) => `✅ **${n}** 曲をキューに追加中…`,
    playing:                (title) => `▶️ **${title}** を再生中…`,

    // ── Slash command descriptions ───────────────────────────────────────────
    cmdP:               '曲をすぐに再生する',
    cmdPQuery:          '曲名またはYouTube URL',
    cmdA:               'キューの末尾に曲を追加する',
    cmdAQuery:          '曲名またはYouTube URL',
    cmdAI:              'AIがムードや雰囲気に合った曲を選ぶ',
    cmdAIPrompt:        'ムード・活動・雰囲気を説明してください',
    cmdVibe:            'AIがムードや雰囲気に合った複数の曲を予約追加する',
    cmdVibePrompt:      'ムード・活動・雰囲気を説明してください',
    cmdVibeCount:       'キューに追加する曲数（デフォルト: 5、最大: 10）',
    cmdSt:              '現在の曲を一時停止する',
    cmdRes:             '一時停止した曲を再開する',
    cmdSk:              '現在の曲をスキップする',
    cmdV:               '再生音量を設定する',
    cmdVPercent:        '音量（0〜200%）',
    cmdLs:              '現在の予約を表示する',
    cmdQ:               '再生を停止してボイスチャンネルから退出する',
  },

};

export default locales;