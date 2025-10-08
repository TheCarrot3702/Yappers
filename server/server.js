const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors()); app.use(express.json());

// In-memory stores for Phase 1 (will be Mongo later)
let users = []; // {id, username, email, roles[], groups[]}
let groups = []; // {id, name, ownerUsername, channels[], members[]}

// Health
app.get('/api/ping', (req,res)=>res.json({success:true}));

// Users
app.get('/api/users', (req,res)=>res.json(users));
app.post('/api/users', (req,res)=>{ const u = { id: crypto.randomUUID(), ...req.body }; users.push(u); res.status(201).json(u); });
app.delete('/api/users/:id', (req,res)=>{ users = users.filter(u=>u.id!==req.params.id); res.sendStatus(204); });

// Groups
app.get('/api/groups', (req,res)=>res.json(groups));
app.post('/api/groups', (req,res)=>{ const g = { id: crypto.randomUUID(), channels:[], members:[], ...req.body }; groups.push(g); res.status(201).json(g); });
app.post('/api/groups/:id/channels', (req,res)=>{ const g=groups.find(x=>x.id===req.params.id); if(!g) return res.sendStatus(404); g.channels.push(req.body.name); res.json(g); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`API on http://localhost:${PORT}`));
