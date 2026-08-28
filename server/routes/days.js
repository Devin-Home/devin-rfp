const express = require('express');
const store = require('../db/init');

const router = express.Router();

// GET all days with their events, ordered
router.get('/', (req, res) => {
  res.json(store.getDays());
});

// CREATE a new day
router.post('/', (req, res) => {
  res.status(201).json(store.createDay(req.body || {}));
});

// UPDATE a day (title/date/city/icon/hotel fields)
router.put('/:id', (req, res) => {
  const day = store.updateDay(req.params.id, req.body || {});
  if (!day) return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
  res.json(day);
});

// DELETE a day (also detaches its events)
router.delete('/:id', (req, res) => {
  const ok = store.deleteDay(req.params.id);
  if (!ok) return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

// CREATE an event under a day
router.post('/:id/events', (req, res) => {
  const day = store.createEvent(req.params.id, req.body || {});
  if (!day) return res.status(404).json({ error: '해당 일정을 찾을 수 없습니다.' });
  res.status(201).json(day);
});

// UPDATE an event
router.put('/events/:eventId', (req, res) => {
  const day = store.updateEvent(req.params.eventId, req.body || {});
  if (!day) return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
  res.json(day);
});

// DELETE an event
router.delete('/events/:eventId', (req, res) => {
  const day = store.deleteEvent(req.params.eventId);
  if (!day) return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
  res.json(day);
});

module.exports = router;
