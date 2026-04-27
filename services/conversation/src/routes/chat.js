const { Router } = require('express');
const pool = require('../db/pool');
const emitter = require('../events/chatEmitter');
const { buildMessages } = require('../services/promptBuilder');
const { complete } = require('../services/llmClient');
const { classifyEmotion } = require('../services/emotionClient');
const { selectModality } = require('../services/ateClient');
const { checkCrisis } = require('../services/crisisClient');
const { checkSafety } = require('../services/filterClient');
const { getHistory } = require('../db/messages');
const { requireAuth } = require('../middleware/auth');

const SAFE_FALLBACK =
  "I'm here for you. What you're going through sounds really hard. " +
  "It might help to talk with a professional who can give you the support you deserve.";

const router = Router();

// Verify session_id belongs to the authenticated user.
async function assertSessionOwner(sessionId, userId) {
  const { rows } = await pool.query(
    'SELECT id FROM sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId],
  );
  return rows.length > 0;
}

// POST /chat
// Body: { session_id: string, message: string }
router.post('/', requireAuth, async (req, res) => {
  const { session_id, message } = req.body;

  if (!session_id || !message) {
    return res.status(400).json({ error: 'session_id and message are required' });
  }

  if (!await assertSessionOwner(session_id, req.userId)) {
    return res.status(403).json({ error: 'Session not found' });
  }

  try {
    // 1. Crisis pre-check — runs before anything else
    const { risk, resources } = await checkCrisis(message);

    if (risk === 'high') {
      const lines = ["I hear you, and I'm glad you reached out. Please contact a crisis line right now:"];
      for (const [name, number] of Object.entries(resources)) {
        lines.push(`  ${name}: ${number}`);
      }
      lines.push("You are not alone.");
      const reply = lines.join('\n');

      await emitter.emit('crisis', { session_id, userMessage: message, reply, risk });
      return res.json({ session_id, reply, crisis: true });
    }

    // 2. Emotion → ATE
    const history = await getHistory(session_id);
    const userMessages = history.filter(m => m.role === 'user').map(m => m.content);

    const { label, confidence } = await classifyEmotion(message, userMessages);

    // Medium risk: nudge the modality guidance to mention professional support
    const { guidance } = await selectModality(label, confidence);
    const fullGuidance = risk === 'medium'
      ? `${guidance} Gently note that professional support is available.`
      : guidance;

    // 3. LLM
    const messages = buildMessages(history, message, fullGuidance);
    let reply = await complete(messages);

    // 4. Safety filter on LLM output
    const { passes } = await checkSafety(reply);
    if (!passes) {
      await emitter.emit('safety_fallback', { session_id });
      reply = SAFE_FALLBACK;
    }

    await emitter.emit('reply', { session_id, userMessage: message, reply });

    res.json({ session_id, reply });
  } catch (err) {
    console.error('[chat]', err.message);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /chat/history/:session_id
router.get('/history/:session_id', requireAuth, async (req, res) => {
  const { session_id } = req.params;

  if (!await assertSessionOwner(session_id, req.userId)) {
    return res.status(403).json({ error: 'Session not found' });
  }

  try {
    const messages = await getHistory(session_id);
    res.json({ session_id, messages });
  } catch (err) {
    console.error('[history]', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
