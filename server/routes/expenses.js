const express = require('express');
const store = require('../db/init');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(store.getExpenses());
});

router.get('/summary', (req, res) => {
  res.json(store.getExpenseSummary());
});

router.post('/', (req, res) => {
  res.status(201).json(store.createExpense(req.body || {}));
});

router.put('/:id', (req, res) => {
  const expense = store.updateExpense(req.params.id, req.body || {});
  if (!expense) return res.status(404).json({ error: '해당 지출 내역을 찾을 수 없습니다.' });
  res.json(expense);
});

router.delete('/:id', (req, res) => {
  const ok = store.deleteExpense(req.params.id);
  if (!ok) return res.status(404).json({ error: '해당 지출 내역을 찾을 수 없습니다.' });
  res.json({ ok: true });
});

module.exports = router;
