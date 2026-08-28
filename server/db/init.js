const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'trip.db'));
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_number INTEGER NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'bkk',
  icon TEXT NOT NULL DEFAULT 'bag',
  hotel_name TEXT,
  hotel_addr TEXT,
  hotel_note TEXT,
  hotel_map_query TEXT,
  hotel_website TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  time TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'activity',
  name TEXT NOT NULL DEFAULT '',
  desc TEXT NOT NULL DEFAULT '',
  map_query TEXT,
  link_url TEXT,
  link_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  day_id INTEGER REFERENCES days(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT '기타',
  description TEXT NOT NULL DEFAULT '',
  amount_thb REAL NOT NULL DEFAULT 0,
  payer TEXT NOT NULL DEFAULT '',
  memo TEXT,
  receipt_image TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER REFERENCES days(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  caption TEXT,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

module.exports = db;
