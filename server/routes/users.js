// server/routes/users.js
import express from "express";
import { getDb } from "../db.js";

const router = express.Router();

// shape: { username, email, roles:[], groups:[], avatarUrl?:string, requestedGroups:[] }
router.get("/", async (_, res) => {
  const users = await getDb().collection("users").find().toArray();
  res.json(users);
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  const user = {
    username: (body.username || "").trim().toLowerCase(),
    email: (body.email || "").trim(),
    roles: body.roles || ["user"],
    groups: body.groups || [],
    requestedGroups: body.requestedGroups || [],
    avatarUrl: body.avatarUrl || null,
  };
  try {
    await getDb().collection("users").insertOne(user);
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/:username", async (req, res) => {
  await getDb().collection("users").deleteOne({ username: req.params.username });
  res.sendStatus(204);
});

export default router;
