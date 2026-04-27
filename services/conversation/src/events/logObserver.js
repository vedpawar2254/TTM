/**
 * Logging observer — logs crisis events and safety fallbacks.
 * Listens to: 'crisis', 'safety_fallback'
 */
const emitter = require('./chatEmitter');

emitter.on('crisis', ({ session_id, risk }) => {
  console.warn(`[crisis] session=${session_id} risk=${risk}`);
});

emitter.on('safety_fallback', ({ session_id }) => {
  console.warn(`[chat] reply failed safety check — using fallback session=${session_id}`);
});
