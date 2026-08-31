const express = require('express');

const router = express.Router();

// Client-facing config. GOOGLE_MAPS_API_KEY is safe to expose here — Maps
// Embed/JS API keys are inherently client-side and should be locked down via
// HTTP referrer restrictions in Google Cloud Console, not kept secret.
router.get('/', (req, res) => {
  res.json({ mapsApiKey: process.env.GOOGLE_MAPS_API_KEY || null });
});

module.exports = router;
