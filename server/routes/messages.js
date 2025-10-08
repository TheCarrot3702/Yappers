// server/routes/messages.js
import express from "express";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { getDb } from "../db.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ---------------------------------------------------------
// 💬 Get recent chat history
// ---------------------------------------------------------
router.get("/", async (req, res) => {
  const { groupId, channel, limit = 50 } = req.query;
  const q = { groupId, channel };
  const docs = await getDb()
    .collection("messages")
    .find(q)
    .sort({ timestamp: -1 })
    .limit(Number(limit))
    .toArray();
  res.json(docs.reverse());
});

// ---------------------------------------------------------
// 🖼️ Upload Setup (avatars & images)
// ---------------------------------------------------------
const uploadRoot = path.join(__dirname, "..", "uploads");
const avatarDir = path.join(uploadRoot, "avatars");
const imageDir = path.join(uploadRoot, "images");
[avatarDir, imageDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

const avatarStorage = multer.diskStorage({
  destination: avatarDir,
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const imageStorage = multer.diskStorage({
  destination: imageDir,
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const avatarUpload = multer({ storage: avatarStorage });
const imageUpload = multer({ storage: imageStorage });

// ---------------------------------------------------------
// 👤 Upload Avatar
// ---------------------------------------------------------
router.post("/upload/avatar", avatarUpload.single("avatar"), async (req, res) => {
  const username = req.body.username;
  const url = `/uploads/avatars/${req.file.filename}`;
  await getDb().collection("users").updateOne(
    { username },
    { $set: { avatarUrl: url } },
    { upsert: true }
  );
  res.json({ url });
});

// ---------------------------------------------------------
// 🖼️ Upload Chat Image
// ---------------------------------------------------------
router.post("/upload/image", imageUpload.single("image"), async (req, res) => {
  const url = `/uploads/images/${req.file.filename}`;
  res.json({ url });
});

export default router;
