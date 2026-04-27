const EMOTION_URL = process.env.EMOTION_SERVICE_URL || 'http://localhost:8001';

/**
 * Classify the emotion in a user message.
 * @param {string} message
 * @param {string[]} historyMessages - recent user-only messages for arc signal
 * @returns {Promise<{label: string, confidence: number, scores: object}>}
 */
async function classifyEmotion(message, historyMessages = []) {
  const res = await fetch(`${EMOTION_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history_messages: historyMessages }),
  });
  if (!res.ok) throw new Error(`Emotion service ${res.status}`);
  return res.json();
}

module.exports = { classifyEmotion };
