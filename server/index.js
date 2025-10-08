const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // allow Angular dev server
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// -------------------------------
// In-memory stores (Phase 1)
// -------------------------------
let users = [];  // {id, username, email, roles[], groups[]}
let groups = []; // {id, name, ownerUsername, channels[], members[]}
let chatHistory = {}; // { 'groupId:channel': [ { username, message, timestamp } ] }

// -------------------------------
// REST API ROUTES
// -------------------------------

// Health check
app.get('/api/ping', (req, res) => res.json({ success: true }));

// Users
app.get('/api/users', (req, res) => res.json(users));

app.post('/api/users', (req, res) => {
  const u = { id: crypto.randomUUID(), ...req.body };
  users.push(u);
  res.status(201).json(u);
});

app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== req.params.id);
  res.sendStatus(204);
});

// Groups
app.get('/api/groups', (req, res) => res.json(groups));

app.post('/api/groups', (req, res) => {
  const g = {
    id: crypto.randomUUID(),
    name: req.body.name,
    ownerUsername: req.body.ownerUsername || 'unknown',
    channels: req.body.channels || ['General'],
    members: req.body.members || [],
    joinRequests: [],
  };
  groups.push(g);
  res.status(201).json(g);
});

// Add channel to group
app.post('/api/groups/:id/channels', (req, res) => {
  const g = groups.find(x => x.id === req.params.id);
  if (!g) return res.sendStatus(404);
  const newChannel = req.body.name;
  if (!g.channels.includes(newChannel)) g.channels.push(newChannel);
  res.json(g);
});

// -------------------------------
// SOCKET.IO CHAT SYSTEM
// -------------------------------
io.on('connection', socket => {
  console.log('🟢 User connected:', socket.id);

  // Join channel
  socket.on('joinChannel', ({ groupId, channel, username }) => {
    const room = `${groupId}:${channel}`;
    socket.join(room);
    console.log(`👤 ${username} joined ${room}`);

    // Send previous chat history to new user
    const history = chatHistory[room] || [];
    socket.emit('loadHistory', history);

    // Notify everyone in room
    io.to(room).emit('systemMessage', `${username} joined ${channel}`);
  });

  // Receive message and broadcast
  socket.on('sendMessage', ({ groupId, channel, username, message }) => {
    const room = `${groupId}:${channel}`;
    const msg = {
      username,
      message,
      channel,
      timestamp: new Date().toISOString()
    };

    // Save to in-memory history
    if (!chatHistory[room]) chatHistory[room] = [];
    chatHistory[room].push(msg);
    if (chatHistory[room].length > 50) chatHistory[room].shift(); // keep last 50 msgs

    io.to(room).emit('receiveMessage', msg);
  });

  // Leave channel
  socket.on('leaveChannel', ({ groupId, channel, username }) => {
    const room = `${groupId}:${channel}`;
    socket.leave(room);
    io.to(room).emit('systemMessage', `${username} left ${channel}`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// -------------------------------
// START SERVER
// -------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ API & Chat server running at http://localhost:${PORT}`)
);
