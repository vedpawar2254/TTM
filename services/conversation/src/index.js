require('dotenv').config();

// Register observers before routes so all events are handled
require('./events/persistenceObserver');
require('./events/logObserver');

const express = require('express');
const chatRouter = require('./routes/chat');
const authRouter = require('./routes/auth');
const sessionsRouter = require('./routes/sessions');

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/sessions', sessionsRouter);
app.use('/chat', chatRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`conversation service listening on :${PORT}`));
