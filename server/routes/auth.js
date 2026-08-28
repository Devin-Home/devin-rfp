const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const hash = process.env.SITE_PASSWORD_HASH;
  if (!hash) {
    return res.status(500).json({ error: '서버에 SITE_PASSWORD_HASH가 설정되어 있지 않습니다.' });
  }
  if (!password || !bcrypt.compareSync(String(password), hash)) {
    return res.status(401).json({ error: '비밀번호가 올바르지 않습니다.' });
  }
  req.session.authed = true;
  res.json({ ok: true });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/session', (req, res) => {
  res.json({ authed: !!(req.session && req.session.authed) });
});

module.exports = router;
