const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const db = require('../db/init');

const router = express.Router();

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME[file.mimetype] || '';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      return cb(new Error('jpg, png, webp, gif 파일만 업로드할 수 있습니다.'));
    }
    cb(null, true);
  },
});

// Raw file upload -> returns filename to reference elsewhere (expense receipt or gallery image)
router.post('/uploads', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });
    res.status(201).json({ filename: req.file.filename, url: `/uploads/${req.file.filename}` });
  });
});

// Gallery: list
router.get('/images', (req, res) => {
  const rows = db.prepare('SELECT * FROM images ORDER BY uploaded_at DESC, id DESC').all();
  res.json(rows);
});

// Gallery: register an uploaded file as a gallery entry
router.post('/images', (req, res) => {
  const b = req.body || {};
  if (!b.filename) return res.status(400).json({ error: 'filename이 필요합니다.' });
  const info = db.prepare('INSERT INTO images (day_id, filename, caption) VALUES (?, ?, ?)')
    .run(b.day_id || null, b.filename, b.caption || null);
  res.status(201).json(db.prepare('SELECT * FROM images WHERE id = ?').get(info.lastInsertRowid));
});

// Gallery: delete
router.delete('/images/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '이미지를 찾을 수 없습니다.' });
  db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);
  const filePath = path.join(uploadsDir, path.basename(row.filename));
  fs.unlink(filePath, () => {});
  res.json({ ok: true });
});

module.exports = router;
