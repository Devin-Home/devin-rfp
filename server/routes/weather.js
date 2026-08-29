const express = require('express');

const router = express.Router();

const CITIES = [
  { key: 'bkk', label: '방콕', lat: 13.7563, lon: 100.5018 },
  { key: 'pty', label: '파타야', lat: 12.9236, lon: 100.8825 },
];

// WMO weather codes used by Open-Meteo, narrowed to what actually shows up
// in tropical Thailand (no snow codes etc).
const WEATHER_CODES = {
  0: { condition: '맑음', icon: '☀️' },
  1: { condition: '대체로 맑음', icon: '🌤️' },
  2: { condition: '구름 조금', icon: '⛅' },
  3: { condition: '흐림', icon: '☁️' },
  45: { condition: '안개', icon: '🌫️' },
  48: { condition: '안개', icon: '🌫️' },
  51: { condition: '약한 이슬비', icon: '🌦️' },
  53: { condition: '이슬비', icon: '🌦️' },
  55: { condition: '강한 이슬비', icon: '🌦️' },
  61: { condition: '약한 비', icon: '🌧️' },
  63: { condition: '비', icon: '🌧️' },
  65: { condition: '강한 비', icon: '🌧️' },
  80: { condition: '소나기', icon: '🌦️' },
  81: { condition: '소나기', icon: '🌦️' },
  82: { condition: '강한 소나기', icon: '⛈️' },
  95: { condition: '뇌우', icon: '⛈️' },
  96: { condition: '뇌우', icon: '⛈️' },
  99: { condition: '뇌우', icon: '⛈️' },
};
function describeWeather(code) {
  return WEATHER_CODES[code] || { condition: '-', icon: '🌡️' };
}

// In-memory cache so we don't hit the upstream API on every page load.
const CACHE_MS = 1000 * 60 * 30; // 30 minutes
let cache = { cities: null, updatedAt: null };

router.get('/', async (req, res) => {
  const now = Date.now();
  if (cache.cities && now - cache.updatedAt < CACHE_MS) {
    return res.json({ cities: cache.cities, updated_at: new Date(cache.updatedAt).toISOString(), cached: true });
  }
  try {
    const lats = CITIES.map((c) => c.lat).join(',');
    const lons = CITIES.map((c) => c.lon).join(',');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current_weather=true&timezone=Asia%2FBangkok`;
    const upstream = await fetch(url);
    if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`);
    const data = await upstream.json();
    const results = Array.isArray(data) ? data : [data];
    const cities = CITIES.map((c, i) => {
      const cw = results[i] && results[i].current_weather;
      const { condition, icon } = describeWeather(cw && cw.weathercode);
      return {
        key: c.key,
        label: c.label,
        temp: cw ? Math.round(cw.temperature) : null,
        condition,
        icon,
      };
    });
    cache = { cities, updatedAt: now };
    res.json({ cities, updated_at: new Date(now).toISOString(), cached: false });
  } catch (e) {
    console.error('weather fetch failed:', e.message);
    if (cache.cities) {
      return res.json({ cities: cache.cities, updated_at: new Date(cache.updatedAt).toISOString(), cached: true, stale: true });
    }
    res.status(502).json({ error: '날씨 조회에 실패했습니다.' });
  }
});

module.exports = router;
