// server/routes/groups.js
import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = express.Router();

// ✅ Get all groups
router.get("/", async (req, res) => {
  try {
    const db = getDb();
    const groups = await db.collection("groups").find().toArray();
    res.json(groups);
  } catch (err) {
    console.error("❌ Failed to fetch groups:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

// ✅ Create a new group
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { name, ownerUsername } = req.body;

    if (!name || !ownerUsername)
      return res.status(400).json({ error: "Missing name or ownerUsername" });

    const group = {
      name,
      ownerUsername,
      members: [ownerUsername],
      joinRequests: [],
      channels: ["General"],
    };

    const result = await db.collection("groups").insertOne(group);
    res.status(201).json({ ...group, _id: result.insertedId });
  } catch (err) {
    console.error("❌ Failed to create group:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// ✅ Request to join a group
router.post("/:id/request", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    const groupId = new ObjectId(req.params.id);

    await db.collection("groups").updateOne(
      { _id: groupId },
      { $addToSet: { joinRequests: username } }
    );

    res.json({ success: true, message: `${username} requested to join group.` });
  } catch (err) {
    console.error("❌ Failed to request join:", err);
    res.status(500).json({ error: "Failed to request join" });
  }
});

// ✅ Approve a join request
router.post("/:id/approve", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    const groupId = new ObjectId(req.params.id);

    await db.collection("groups").updateOne(
      { _id: groupId },
      {
        $pull: { joinRequests: username },
        $addToSet: { members: username },
      }
    );

    res.json({ success: true, message: `${username} has been approved.` });
  } catch (err) {
    console.error("❌ Failed to approve join:", err);
    res.status(500).json({ error: "Failed to approve join" });
  }
});

// ✅ Remove a member (user leaves or is removed)
router.post("/:id/remove", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    const groupId = new ObjectId(req.params.id);

    await db.collection("groups").updateOne(
      { _id: groupId },
      { $pull: { members: username } }
    );

    res.json({ success: true, message: `${username} removed from group.` });
  } catch (err) {
    console.error("❌ Failed to remove member:", err);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// ✅ Add a new channel
router.post("/:id/channel", async (req, res) => {
  try {
    const db = getDb();
    const { channel } = req.body;
    const groupId = new ObjectId(req.params.id);

    await db.collection("groups").updateOne(
      { _id: groupId },
      { $addToSet: { channels: channel } }
    );

    res.json({ success: true, message: `Channel ${channel} added.` });
  } catch (err) {
    console.error("❌ Failed to add channel:", err);
    res.status(500).json({ error: "Failed to add channel" });
  }
});

export default router;
