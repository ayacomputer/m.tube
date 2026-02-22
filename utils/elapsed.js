/**
 * Returns total elapsed playback milliseconds,
 * including any accumulated time from previous pauses.
 * @param {import('../store.js').GuildState} state
 */
export function getElapsedMs(state) {
  if (!state.playStartTime) return state.accumulatedMs;
  return state.accumulatedMs + (Date.now() - state.playStartTime);
}

/** Mark the start (or restart) of active playback. */
export function resetElapsed(state) {
  state.accumulatedMs = 0;
  state.playStartTime = Date.now();
}

/** Snapshot elapsed time when playback is paused. */
export function freezeElapsed(state) {
  state.accumulatedMs = getElapsedMs(state);
  state.playStartTime = null;
}

/** Resume counting from the frozen snapshot. */
export function resumeElapsed(state) {
  state.playStartTime = Date.now();
}
