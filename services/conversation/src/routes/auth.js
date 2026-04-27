const { Router } = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = Router();

// POST /auth/anon
// Creates an anonymous user (no PII) and returns a signed JWT.
router.post('/anon', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (id) VALUES (gen_random_uuid()) RETURNING id`,
    );
    const token = jwt.sign(
      { sub: rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '90d' },
    );
    res.json({ token });
  } catch (err) {
    console.error('[auth]', err.message);
    res.status(500).json({ error: 'Failed to initialise account' });
  }
});

module.exports = router;
