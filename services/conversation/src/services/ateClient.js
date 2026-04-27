const ATE_URL = process.env.ATE_SERVICE_URL || 'http://localhost:8002';

/**
 * Select a therapeutic modality for the given emotion.
 * @param {string} emotionLabel
 * @param {number} confidence
 * @returns {Promise<{modality: string, guidance: string}>}
 */
async function selectModality(emotionLabel, confidence) {
  const res = await fetch(`${ATE_URL}/modality`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emotion_label: emotionLabel, confidence }),
  });
  if (!res.ok) throw new Error(`ATE service ${res.status}`);
  return res.json();
}

module.exports = { selectModality };
