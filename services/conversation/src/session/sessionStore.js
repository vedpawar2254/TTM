/**
 * Redis-backed session cache for conversation history.
 *
 * Key schema : session:{sessionId}:history  →  JSON array of {role, content}
 * TTL        : 7 days, refreshed on every write
 * Fallback   : all methods fail silently — caller falls back to Postgres
 */

const { createClient } = require('redis');
const { MAX_HISTORY_TURNS } = require('../context/contextWindow');

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

let _client = null;
let _connecting = false;

async function getClient() {
  if (_client?.isReady) return _client;
  if (_connecting) return null; // avoid parallel connect storms

  _connecting = true;
  try {
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', err => console.error('[redis]', err.message));
    await client.connect();
    _client = client;
    console.log('[redis] connected');
    return _client;
  } catch (err) {
    console.warn('[redis] unavailable — falling back to Postgres:', err.message);
    return null;
  } finally {
    _connecting = false;
  }
}

function historyKey(sessionId) {
  return `session:${sessionId}:history`;
}

/**
 * Fetch cached history for a session.
 * Returns null on miss or error (caller should fall back to Postgres).
 * @param {string} sessionId
 * @returns {Promise<Array<{role:string,content:string}>|null>}
 */
async function getCachedHistory(sessionId) {
  try {
    const client = await getClient();
    if (!client) return null;
    const raw = await client.get(historyKey(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('[redis] getCachedHistory error:', err.message);
    return null;
  }
}

/**
 * Overwrite the cached history for a session.
 * Silently fails if Redis is unavailable.
 * @param {string} sessionId
 * @param {Array<{role:string,content:string}>} messages
 */
async function setCachedHistory(sessionId, messages) {
  try {
    const client = await getClient();
    if (!client) return;
    await client.set(
      historyKey(sessionId),
      JSON.stringify(messages.slice(-MAX_HISTORY_TURNS)),
      { EX: SESSION_TTL_SECONDS },
    );
  } catch (err) {
    console.warn('[redis] setCachedHistory error:', err.message);
  }
}

/**
 * Append a single message to the cached history and refresh TTL.
 * @param {string} sessionId
 * @param {'user'|'assistant'} role
 * @param {string} content
 */
async function appendToCache(sessionId, role, content) {
  try {
    const client = await getClient();
    if (!client) return;
    const existing = await getCachedHistory(sessionId) ?? [];
    const updated = [...existing, { role, content }].slice(-MAX_HISTORY_TURNS);
    await setCachedHistory(sessionId, updated);
  } catch (err) {
    console.warn('[redis] appendToCache error:', err.message);
  }
}

module.exports = { getCachedHistory, setCachedHistory, appendToCache };
