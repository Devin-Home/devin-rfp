const express = require('express');
const store = require('../db/init');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.getSpots());
});

router.post('/', (req, res) => {
  res.status(201).json(store.createSpot(req.body || {}));
});

router.put('/:id', (req, res) => {
  const spot = store.updateSpot(req.params.id, req.body || {});
  if (!spot) return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
  res.json(spot);
});

router.delete('/:id', (req, res) => {
  const ok = store.deleteSpot(req.params.id);
  if (!ok) return res.status(404).json({ error: '해당 항목을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

module.exports = router;
