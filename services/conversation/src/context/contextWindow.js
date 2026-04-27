/**
 * Context window assembly — manages token budget across system prompt, history, and generation.
 *
 * Budget (approximate tokens):
 *   ~400  system prompt + modality guidance
 *   ~2000 turn history
 *   ~1600 reserved for LLM generation
 */

const MAX_HISTORY_TURNS = 20;
const HISTORY_TOKEN_BUDGET = 2000;

/** Rough estimator: ~4 chars per token */
function estimateTokens(text) {
  return Math.ceil((text || '').length / 4);
}

/**
 * Trim history to fit within the history token budget.
 * Drops oldest turns first; always keeps at least the most recent turn.
 * @param {Array<{role: string, content: string}>} history
 * @returns {Array<{role: string, content: string}>}
 */
function trimHistory(history) {
  const recent = history.slice(-MAX_HISTORY_TURNS);
  let tokens = recent.reduce((sum, m) => sum + estimateTokens(m.content), 0);

  while (tokens > HISTORY_TOKEN_BUDGET && recent.length > 1) {
    tokens -= estimateTokens(recent[0].content);
    recent.shift();
  }
  return recent;
}

/**
 * Assemble the full context window ready for the LLM.
 * @param {string} systemPrompt
 * @param {Array<{role: string, content: string}>} history
 * @param {string} userMessage
 * @returns {{ messages: Array<{role: string, content: string}>, truncated: boolean, turns: number }}
 */
function assembleContextWindow(systemPrompt, history, userMessage) {
  const trimmed = trimHistory(history);

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      ...trimmed,
      { role: 'user', content: userMessage },
    ],
    truncated: trimmed.length < history.length,
    turns: trimmed.length,
  };
}

module.exports = { assembleContextWindow, trimHistory, MAX_HISTORY_TURNS, HISTORY_TOKEN_BUDGET };
