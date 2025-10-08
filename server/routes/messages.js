const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { getDb } = require('../db');

// History REST (optional if you prefer sockets only)
router.get('/', async (req, res) => {
  const { groupId, channel, limit = 50 } = req.query;
  const q = { groupId, channel };
  const docs = await getDb().collection('messages')
    .find(q).sort({ timestamp: -1 }).limit(Number(limit)).toArray();
  res.json(docs.reverse());
});

/** Multer setups */
const avatarStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads', 'avatars'),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const imageStorage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads', 'images'),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const avatarUpload = multer({ storage: avatarStorage });
const imageUpload = multer({ storage: imageStorage });

/** Upload avatar: returns public URL */
router.post('/upload/avatar', avatarUpload.single('avatar'), async (req, res) => {
  const username = req.body.username;
  const url = `/uploads/avatars/${req.file.filename}`;
  await getDb().collection('users').updateOne(
    { username },
    { $set: { avatarUrl: url } }
  );
  res.json({ url });
});

/** Upload chat image: returns public URL for message */
router.post('/upload/image', imageUpload.single('image'), async (req, res) => {
  const url = `/uploads/images/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
