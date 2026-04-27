const CRISIS_URL = process.env.CRISIS_SERVICE_URL || 'http://localhost:8003';

/**
 * Check a user message for crisis risk.
 * @param {string} message
 * @returns {Promise<{risk: string, probability: number, resources: object}>}
 */
async function checkCrisis(message) {
  const res = await fetch(`${CRISIS_URL}/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Crisis service ${res.status}`);
  return res.json();
}

module.exports = { checkCrisis };
