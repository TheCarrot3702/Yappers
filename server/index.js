import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// PeerJS for video chat
const peerServer = ExpressPeerServer(server, { path: "/" });
app.use("/peerjs", peerServer);

// ---------------------------------------------------------
// 🧠 MongoDB
// ---------------------------------------------------------
const client = new MongoClient(process.env.MONGO_URI);
let db;
const collections = {};

async function connectDB() {
  try {
    await client.connect();
    db = client.db(process.env.MONGO_DB);
    collections.users = db.collection("users");
    collections.groups = db.collection("groups");
    collections.messages = db.collection("messages");

    console.log(`✅ Connected to MongoDB db="${db.databaseName}"`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
connectDB();

// ---------------------------------------------------------
// 🩺 Health Check
// ---------------------------------------------------------
app.get("/api/ping", (_, res) => res.json({ success: true }));

// ---------------------------------------------------------
// 🖼️ Uploads (images & avatars)
// ---------------------------------------------------------
const uploadRoot = path.join(process.cwd(), "uploads");
const chatDir = path.join(uploadRoot, "chat");
const avatarDir = path.join(uploadRoot, "avatars");
[uploadRoot, chatDir, avatarDir].forEach((d) => fs.mkdirSync(d, { recursive: true }));

app.use("/uploads/chat", express.static(chatDir));
app.use("/uploads/avatars", express.static(avatarDir));

const chatStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, chatDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const avatarStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, avatarDir),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});

const uploadChat = multer({ storage: chatStorage });
const uploadAvatar = multer({ storage: avatarStorage });

app.post("/api/upload", uploadChat.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const url = `http://localhost:${process.env.PORT}/uploads/chat/${req.file.filename}`;
  res.json({ url });
});

app.post("/api/upload/avatar", uploadAvatar.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const username = req.body.username?.trim();
  const url = `http://localhost:${process.env.PORT}/uploads/avatars/${req.file.filename}`;

  await collections.users.updateOne(
    { username },
    { $set: { username, avatarUrl: url } },
    { upsert: true }
  );

  console.log(`🧑‍🎤 Avatar uploaded for ${username}`);
  res.json({ url });
});

// ---------------------------------------------------------
// 👥 Groups CRUD
// ---------------------------------------------------------
app.get("/api/groups", async (_, res) => {
  const groups = await collections.groups.find().toArray();
  res.json(groups);
});

app.post("/api/groups", async (req, res) => {
  const { name, ownerUsername } = req.body;
  const group = {
    name,
    ownerUsername,
    channels: ["General"],
    members: [ownerUsername],
    joinRequests: [],
  };
  const result = await collections.groups.insertOne(group);
  res.status(201).json({ ...group, _id: result.insertedId });
});

// ---------------------------------------------------------
// 💬 Sockets
// ---------------------------------------------------------
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinChannel", async ({ groupId, channel, username }) => {
    socket.join(channel);

    const user = await collections.users.findOne({ username });
    if (!user) await collections.users.insertOne({ username, avatarUrl: null });

    const history = await collections.messages
      .find({ groupId, channel })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    socket.emit("loadHistory", history.reverse());

    io.to(channel).emit("systemMessage", {
      type: "join",
      username,
      text: `🟢 ${username} joined ${channel}`,
      channel,
      timestamp: new Date(),
    });

    console.log(`✅ ${username} joined ${channel}`);
  });

  socket.on("sendMessage", async ({ groupId, channel, username, message, avatarUrl }) => {
    const msg = {
      username,
      message,
      avatarUrl: avatarUrl || null,
      groupId,
      channel,
      timestamp: new Date(),
      type: "text",
    };
    await collections.messages.insertOne(msg);
    io.to(channel).emit("receiveMessage", msg);
  });

  socket.on("sendImage", async ({ groupId, channel, username, imageUrl, avatarUrl }) => {
    const msg = {
      username,
      imageUrl,
      avatarUrl: avatarUrl || null,
      groupId,
      channel,
      timestamp: new Date(),
      type: "image",
    };
    await collections.messages.insertOne(msg);
    io.to(channel).emit("receiveMessage", msg);
  });

  socket.on("leaveChannel", ({ channel, username }) => {
    socket.leave(channel);
    io.to(channel).emit("systemMessage", {
      type: "leave",
      username,
      text: `🔴 ${username} left ${channel}`,
      channel,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 API on http://localhost:${PORT}`);
  console.log(`🎥 PeerJS on /peerjs`);
});
