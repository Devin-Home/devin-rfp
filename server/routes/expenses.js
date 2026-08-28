const express = require('express');
const db = require('../db/init');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY date ASC, id ASC').all();
  res.json(rows);
});

router.get('/summary', (req, res) => {
  const total = db.prepare('SELECT COALESCE(SUM(amount_thb), 0) AS total FROM expenses').get().total;
  const byCategory = db.prepare('SELECT category, COALESCE(SUM(amount_thb), 0) AS total FROM expenses GROUP BY category ORDER BY total DESC').all();
  const byPayer = db.prepare('SELECT payer, COALESCE(SUM(amount_thb), 0) AS total FROM expenses WHERE payer != \'\' GROUP BY payer ORDER BY total DESC').all();
  res.json({ total, byCategory, byPayer });
});

router.post('/', (req, res) => {
  const b = req.body || {};
  const info = db.prepare(`
    INSERT INTO expenses (date, day_id, category, description, amount_thb, payer, memo, receipt_image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    b.date || new Date().toISOString().slice(0, 10), b.day_id || null, b.category || '기타',
    b.description || '', Number(b.amount_thb) || 0, b.payer || '', b.memo || null, b.receipt_image || null,
  );
  res.status(201).json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: '해당 지출 내역을 찾을 수 없습니다.' });
  const b = req.body || {};
  db.prepare(`
    UPDATE expenses SET date=?, day_id=?, category=?, description=?, amount_thb=?, payer=?, memo=?, receipt_image=?
    WHERE id=?
  `).run(
    b.date ?? existing.date, b.day_id ?? existing.day_id, b.category ?? existing.category,
    b.description ?? existing.description, b.amount_thb != null ? Number(b.amount_thb) : existing.amount_thb,
    b.payer ?? existing.payer, b.memo ?? existing.memo, b.receipt_image ?? existing.receipt_image,
    req.params.id,
  );
  res.json(db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: '해당 지출 내역을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

module.exports = router;
