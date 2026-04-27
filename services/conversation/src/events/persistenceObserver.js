/**
 * Persistence observer — saves user + assistant messages to DB.
 * Listens to: 'reply', 'crisis'
 */
const { saveMessage } = require('../db/messages');
const emitter = require('./chatEmitter');

emitter.on('reply', async ({ session_id, userMessage, reply }) => {
  await saveMessage(session_id, 'user', userMessage);
  await saveMessage(session_id, 'assistant', reply);
});

emitter.on('crisis', async ({ session_id, userMessage, reply }) => {
  await saveMessage(session_id, 'user', userMessage);
  await saveMessage(session_id, 'assistant', reply);
});
