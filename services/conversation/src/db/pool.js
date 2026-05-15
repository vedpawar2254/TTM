const { Pool } = require('pg');

function needsSsl(connectionString = '') {
  return process.env.PGSSLMODE === 'require'
    || process.env.DATABASE_SSL === 'true'
    || connectionString.includes('render.com');
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
