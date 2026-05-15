const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function needsSsl(connectionString = '') {
  return process.env.PGSSLMODE === 'require'
    || process.env.DATABASE_SSL === 'true'
    || connectionString.includes('render.com');
}

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({
    connectionString,
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });
  const dir = path.join(__dirname, 'migrations');

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }

  console.log('Migrations complete');
  await pool.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
