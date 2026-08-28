const express = require('express');
const db = require('../db/init');

const router = express.Router();

function getDayWithEvents(dayId) {
  const day = db.prepare('SELECT * FROM days WHERE id = ?').get(dayId);
  if (!day) return null;
  day.events = db.prepare('SELECT * FROM events WHERE day_id = ? ORDER BY time ASC, sort_order ASC').all(dayId);
  return day;
}

// GET all days with their events, ordered
router.get('/', (req, res) => {
  const days = db.prepare('SELECT * FROM days ORDER BY sort_order ASC, day_number ASC').all();
  const withEvents = days.map((d) => ({
    ...d,
    events: db.prepare('SELECT * FROM events WHERE day_id = ? ORDER BY time ASC, sort_order ASC').all(d.id),
  }));
  res.json(withEvents);
});

// CREATE a new day
router.post('/', (req, res) => {
  const b = req.body || {};
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM days').get().m;
  const maxNum = db.prepare('SELECT COALESCE(MAX(day_number), 0) AS m FROM days').get().m;
  const info = db.prepare(`
    INSERT INTO days (day_number, date, title, city, icon, hotel_name, hotel_addr, hotel_note, hotel_map_query, hotel_website, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    b.day_number || maxNum + 1, b.date || '', b.title || '새 일정', b.city || 'bkk', b.icon || 'bag',
    b.hotel_name || null, b.hotel_addr || null, b.hotel_note || null, b.hotel_map_query || null, b.hotel_website || null,
    maxOrder + 1,
  );
  res.status(201).json(getDayWithEvents(info.lastInsertRowid));
});

// UPDATE a day (title/date/city/icon/hotel fields)
router.put('/:id', (req, res) => {
  const b = req.body || {};
  const existing = db.prepare('SELECT * FROM days WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
  db.prepare(`
    UPDATE days SET day_number=?, date=?, title=?, city=?, icon=?,
      hotel_name=?, hotel_addr=?, hotel_note=?, hotel_map_query=?, hotel_website=?
    WHERE id=?
  `).run(
    b.day_number ?? existing.day_number, b.date ?? existing.date, b.title ?? existing.title,
    b.city ?? existing.city, b.icon ?? existing.icon,
    b.hotel_name ?? existing.hotel_name, b.hotel_addr ?? existing.hotel_addr, b.hotel_note ?? existing.hotel_note,
    b.hotel_map_query ?? existing.hotel_map_query, b.hotel_website ?? existing.hotel_website,
    req.params.id,
  );
  res.json(getDayWithEvents(req.params.id));
});

// DELETE a day (cascades to its events)
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM days WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

// CREATE an event under a day
router.post('/:id/events', (req, res) => {
  const day = db.prepare('SELECT id FROM days WHERE id = ?').get(req.params.id);
  if (!day) return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
  const b = req.body || {};
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM events WHERE day_id = ?').get(req.params.id).m;
  const info = db.prepare(`
    INSERT INTO events (day_id, time, type, name, desc, map_query, link_url, link_label, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.params.id, b.time || '', b.type || 'activity', b.name || '새 항목', b.desc || '',
    b.map_query || null, b.link_url || null, b.link_label || null, maxOrder + 1,
  );
  res.status(201).json(getDayWithEvents(req.params.id));
});

// UPDATE an event
router.put('/events/:eventId', (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  if (!existing) return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
  const b = req.body || {};
  db.prepare(`
    UPDATE events SET time=?, type=?, name=?, desc=?, map_query=?, link_url=?, link_label=?
    WHERE id=?
  `).run(
    b.time ?? existing.time, b.type ?? existing.type, b.name ?? existing.name, b.desc ?? existing.desc,
    b.map_query ?? existing.map_query, b.link_url ?? existing.link_url, b.link_label ?? existing.link_label,
    req.params.eventId,
  );
  res.json(getDayWithEvents(existing.day_id));
});

// DELETE an event
router.delete('/events/:eventId', (req, res) => {
  const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.eventId);
  if (!existing) return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.eventId);
  res.json(getDayWithEvents(existing.day_id));
});

module.exports = router;
