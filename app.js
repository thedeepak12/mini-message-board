const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createTableIfNotExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        "user" VARCHAR(100) NOT NULL,
        added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "messages" is ready');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}
createTableIfNotExists();

app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY added DESC');
    res.render('index', {
      title: 'Mini Message Board',
      messages: rows,
    });
  } catch (err) {
    console.error(err);
    res.render('index', {
      title: 'Mini Message Board',
      messages: [],
    });
  }
});

app.get('/new', (req, res) => {
  res.render('form', {
    title: 'New Message',
  });
});

app.post('/new', async (req, res) => {
  try {
    const { messageUser, messageText } = req.body;
    await pool.query(
      'INSERT INTO messages (text, "user") VALUES ($1, $2)',
      [messageText, messageUser]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
