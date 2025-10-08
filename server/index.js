// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { ExpressPeerServer } from "peer";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectMongo, getDb } from "./db.js";
import usersRouter from "./routes/users.js";
import groupsRouter from "./routes/groups.js";
import messagesRouter from "./routes/messages.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🎥 PeerJS for video chat
const peerServer = ExpressPeerServer(server, { path: "/" });
app.use("/peerjs", peerServer);

// ---------------------------------------------------------
// 🧠 MongoDB Connection
// ---------------------------------------------------------
await connectMongo();
const db = getDb();

// ---------------------------------------------------------
// 🩺 Health Check
// ---------------------------------------------------------
app.get("/api/ping", (_, res) => res.json({ success: true }));

// ---------------------------------------------------------
// 🖼️ Uploads (images & avatars)
// ---------------------------------------------------------
const uploadRoot = path.join(__dirname, "uploads");
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

  await db.collection("users").updateOne(
    { username },
    { $set: { username, avatarUrl: url } },
    { upsert: true }
  );

  console.log(`🧑‍🎤 Avatar uploaded for ${username}`);
  res.json({ url });
});

// ---------------------------------------------------------
// 👥 Register Routes
// ---------------------------------------------------------
app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);
app.use("/api/messages", messagesRouter);

// ---------------------------------------------------------
// 💬 Sockets for chat
// ---------------------------------------------------------
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("joinChannel", async ({ groupId, channel, username }) => {
    // ✅ Use groupId:channel room to isolate groups
    const room = `${groupId}:${channel}`;
    socket.join(room);

    const usersCol = db.collection("users");
    const user = await usersCol.findOne({ username });
    if (!user) await usersCol.insertOne({ username, avatarUrl: null });

    // ✅ Load and send last 50 messages
    const history = await db
      .collection("messages")
      .find({ groupId, channel })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    socket.emit("loadHistory", history.reverse());

    // ✅ Broadcast system join message
    const joinMsg = {
      type: "system",
      username,
      message: `🟢 ${username} joined ${channel}`,
      groupId,
      channel,
      timestamp: new Date().toISOString(),
    };
    await db.collection("messages").insertOne(joinMsg); // optional but keeps it in history
    io.to(room).emit("systemMessage", joinMsg);

    console.log(`✅ ${username} joined ${room}`);
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
    await db.collection("messages").insertOne(msg);
    io.to(`${groupId}:${channel}`).emit("receiveMessage", msg);
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
    await db.collection("messages").insertOne(msg);
    io.to(`${groupId}:${channel}`).emit("receiveMessage", msg);
  });

  socket.on("leaveChannel", async ({ groupId, channel, username }) => {
    const room = `${groupId}:${channel}`;
    socket.leave(room);

    // ✅ Broadcast system leave message
    const leaveMsg = {
      type: "system",
      username,
      message: `🔴 ${username} left ${channel}`,
      groupId,
      channel,
      timestamp: new Date().toISOString(),
    };
    await db.collection("messages").insertOne(leaveMsg); // optional
    io.to(room).emit("systemMessage", leaveMsg);

    console.log(`🔴 ${username} left ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});


// ---------------------------------------------------------
// 🚀 Start Server
// ---------------------------------------------------------
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`🌐 API running at http://localhost:${PORT}`);
    console.log(`🎥 PeerJS available at /peerjs`);
  });
}

export { app, server };

