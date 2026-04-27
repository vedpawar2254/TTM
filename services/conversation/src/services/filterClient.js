const FILTER_URL = process.env.FILTER_SERVICE_URL || 'http://localhost:8004';

/**
 * Run safety checks on an LLM response.
 * @param {string} response
 * @returns {Promise<{passes: boolean, safety_reason: string, crisis_probability: number}>}
 */
async function checkSafety(response) {
  const res = await fetch(`${FILTER_URL}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response }),
  });
  if (!res.ok) throw new Error(`Filter service ${res.status}`);
  return res.json();
}

module.exports = { checkSafety };
