// Express backend for PostgreSQL admin API
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// TODO: Replace with your actual Render.com PostgreSQL credentials
const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING || 'postgres://user:password@host:port/dbname',
  ssl: { rejectUnauthorized: false }
});

// List all tables
app.get('/tables', async (req, res) => {
  try {
    const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get table data (with optional search)
app.get('/table/:name', async (req, res) => {
  const { name } = req.params;
  const { search } = req.query;
  try {
    let query = `SELECT * FROM "${name}"`;
    if (search) {
      // Simple search: filter by string match in any column
      // (for demo, only works for text columns)
      query += ` WHERE ` +
        `(SELECT string_agg(CAST(t AS TEXT), ' ') FROM (SELECT * FROM "${name}") AS t) ILIKE '%${search}%'`;
    }
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advisory lock check
app.get('/advisory-locks', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM pg_locks WHERE locktype = 'advisory'`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
