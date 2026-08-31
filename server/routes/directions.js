const express = require('express');

const router = express.Router();

// In-memory cache keyed by the exact stop list, so we don't hit the (billed) Directions
// API on every page load — itinerary stops rarely change once the trip is planned.
const CACHE_MS = 1000 * 60 * 60 * 24; // 24 hours
const cache = new Map(); // key -> { data, updatedAt }

router.get('/', async (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return res.status(404).json({ error: 'Maps API 키가 설정되어 있지 않습니다.' });

  const { origin, destination, waypoints } = req.query;
  if (!origin || !destination) return res.status(400).json({ error: 'origin, destination이 필요합니다.' });

  const cacheKey = `${origin}|${destination}|${waypoints || ''}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.updatedAt < CACHE_MS) {
    return res.json({ ...hit.data, cached: true });
  }

  try {
    const params = new URLSearchParams({ origin, destination, mode: 'driving', key });
    if (waypoints) params.set('waypoints', waypoints);
    // The API key is restricted to our site's HTTP referrer (it's the same key used
    // client-side for the Maps Embed iframes). This call happens server-side, so it
    // wouldn't naturally carry that header — forward the browser's own referer along,
    // which is already this same site, so it satisfies the same restriction.
    const referer = req.get('referer');
    const upstream = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`, {
      headers: referer ? { Referer: referer } : {},
    });
    if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`);
    const data = await upstream.json();
    const route = data.routes && data.routes[0];
    if (data.status !== 'OK' || !route) throw new Error(`directions status: ${data.status}`);

    const legs = route.legs || [];
    const totalMeters = legs.reduce((sum, l) => sum + ((l.distance && l.distance.value) || 0), 0);
    const totalSeconds = legs.reduce((sum, l) => sum + ((l.duration && l.duration.value) || 0), 0);
    const result = {
      distance_km: Math.round((totalMeters / 1000) * 10) / 10,
      duration_min: Math.round(totalSeconds / 60),
      legs: legs.length,
      // Per-leg breakdown (stop N → stop N+1), so the frontend can show distance/time
      // between each pair of consecutive stops, not just the trip-wide total.
      legs_detail: legs.map((l) => ({
        distance_km: l.distance ? Math.round((l.distance.value / 1000) * 10) / 10 : null,
        duration_min: l.duration ? Math.round(l.duration.value / 60) : null,
      })),
    };
    cache.set(cacheKey, { data: result, updatedAt: now });
    res.json({ ...result, cached: false });
  } catch (e) {
    console.error('directions fetch failed:', e.message);
    if (hit) return res.json({ ...hit.data, cached: true, stale: true });
    res.status(502).json({ error: '이동거리 조회에 실패했습니다.' });
  }
});

module.exports = router;
