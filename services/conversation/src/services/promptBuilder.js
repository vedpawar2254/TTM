const { assembleContextWindow } = require('../context/contextWindow');

const SYSTEM_PROMPT = `You are TalktoMe, a compassionate mental health support companion.
Listen actively, validate feelings, and offer gentle, non-judgmental support.
You are not a replacement for professional therapy — encourage professional help when appropriate.
Keep responses concise and warm.`;

/**
 * Build an OpenRouter-compatible messages array from history + new user message.
 * Uses contextWindow to trim history to token budget before assembling.
 * @param {Array<{role: string, content: string}>} history - prior turns (ordered ASC)
 * @param {string} userMessage - current user input
 * @param {string} [modalityGuidance] - therapeutic approach hint from ATE
 * @returns {Array<{role: string, content: string}>}
 */
function buildMessages(history, userMessage, modalityGuidance = '') {
  const systemContent = modalityGuidance
    ? `${SYSTEM_PROMPT}\n\nTherapeutic approach for this response: ${modalityGuidance}`
    : SYSTEM_PROMPT;

  const { messages, truncated } = assembleContextWindow(systemContent, history, userMessage);

  if (truncated) {
    console.debug(`[promptBuilder] history truncated to fit token budget`);
  }

  return messages;
}

module.exports = { buildMessages };
