const { Router } = require('express');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/auth');

const router = Router();

// POST /sessions — create a new session for the authenticated user
router.post('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `INSERT INTO sessions (id, user_id) VALUES (gen_random_uuid(), $1) RETURNING id`,
      [req.userId],
    );
    res.json({ session_id: rows[0].id });
  } catch (err) {
    console.error('[sessions]', err.message);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

module.exports = router;
