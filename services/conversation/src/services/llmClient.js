const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Send a messages array to OpenRouter and return the assistant reply string.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<string>}
 */
async function complete(messages) {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL || 'anthropic/claude-3.5-haiku',
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

module.exports = { complete };
