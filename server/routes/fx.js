const express = require('express');

const router = express.Router();

// In-memory cache so we don't hammer the upstream API on every page load.
const CACHE_MS = 1000 * 60 * 60 * 6; // 6 hours
let cache = { rate: null, updatedAt: null };

router.get('/', async (req, res) => {
  const now = Date.now();
  if (cache.rate && now - cache.updatedAt < CACHE_MS) {
    return res.json({ rate: cache.rate, updated_at: new Date(cache.updatedAt).toISOString(), source: 'frankfurter.app', cached: true });
  }
  try {
    const upstream = await fetch('https://api.frankfurter.app/latest?from=THB&to=KRW');
    if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`);
    const data = await upstream.json();
    const rate = data.rates && data.rates.KRW;
    if (!rate) throw new Error('response had no KRW rate');
    cache = { rate, updatedAt: now };
    res.json({ rate, updated_at: new Date(now).toISOString(), source: 'frankfurter.app', cached: false });
  } catch (e) {
    console.error('fx fetch failed:', e.message);
    if (cache.rate) {
      return res.json({ rate: cache.rate, updated_at: new Date(cache.updatedAt).toISOString(), source: 'frankfurter.app', cached: true, stale: true });
    }
    res.status(502).json({ error: '환율 조회에 실패했습니다.' });
  }
});

module.exports = router;
