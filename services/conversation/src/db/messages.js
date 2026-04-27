const pool = require('./pool');
const { getCachedHistory, setCachedHistory, appendToCache } = require('../session/sessionStore');

const HISTORY_LIMIT = 20;

/**
 * Fetch the last N turns for a session, ordered oldest-first.
 * Checks Redis cache first; falls back to Postgres on miss.
 * @param {string} sessionId
 * @returns {Promise<Array<{role: string, content: string}>>}
 */
async function getHistory(sessionId) {
  const cached = await getCachedHistory(sessionId);
  if (cached !== null) return cached;

  const { rows } = await pool.query(
    `SELECT role, content
     FROM messages
     WHERE session_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [sessionId, HISTORY_LIMIT],
  );

  if (rows.length > 0) await setCachedHistory(sessionId, rows);
  return rows;
}

/**
 * Persist a single message turn to Postgres and update the Redis cache.
 * @param {string} sessionId
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
async function saveMessage(sessionId, role, content) {
  await pool.query(
    `INSERT INTO messages (session_id, role, content)
     VALUES ($1, $2, $3)`,
    [sessionId, role, content],
  );
  await appendToCache(sessionId, role, content);
}

module.exports = { getHistory, saveMessage };
