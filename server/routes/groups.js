import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";

const router = express.Router();

/* ------------------------------------------------------------------
   🧠 GET ALL GROUPS
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
   🏗️ CREATE GROUP
------------------------------------------------------------------ */
router.post("/", async (req, res) => {
  try {
    const db = getDb();
    const { name, ownerUsername } = req.body;

    if (!name || !ownerUsername)
      return res.status(400).json({ error: "Missing name or ownerUsername" });

    // Prevent duplicates by name if desired
    const existing = await db.collection("groups").findOne({ name });
    if (existing)
      return res.status(400).json({ error: "A group with that name already exists" });

    const group = {
      name,
      ownerUsername,
      members: [ownerUsername],
      joinRequests: [],
      channels: ["General"],
      createdAt: new Date(),
    };

    const result = await db.collection("groups").insertOne(group);
    res.status(201).json({ ...group, _id: result.insertedId });
  } catch (err) {
    console.error("❌ Failed to create group:", err);
    res.status(500).json({ error: "Failed to create group" });
  }
});

/* ------------------------------------------------------------------
   📨 REQUEST TO JOIN GROUP
------------------------------------------------------------------ */
router.post("/:id/request", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

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

/* ------------------------------------------------------------------
   ✅ APPROVE JOIN REQUEST
------------------------------------------------------------------ */
router.post("/:id/approve", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

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

/* ------------------------------------------------------------------
   ❌ REJECT JOIN REQUEST
------------------------------------------------------------------ */
router.post("/:id/reject", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

    const groupId = new ObjectId(req.params.id);
    await db.collection("groups").updateOne(
      { _id: groupId },
      { $pull: { joinRequests: username } }
    );

    res.json({ success: true, message: `${username}'s request rejected.` });
  } catch (err) {
    console.error("❌ Failed to reject join:", err);
    res.status(500).json({ error: "Failed to reject join" });
  }
});

/* ------------------------------------------------------------------
   👋 REMOVE MEMBER
------------------------------------------------------------------ */
router.post("/:id/remove-member", async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "Missing username" });

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

/* ------------------------------------------------------------------
   ➕ ADD CHANNEL
------------------------------------------------------------------ */
router.post("/:id/channels", async (req, res) => {
  try {
    const db = getDb();
    const { channel } = req.body;
    if (!channel) return res.status(400).json({ error: "Missing channel name" });

    const groupId = new ObjectId(req.params.id);
    await db.collection("groups").updateOne(
      { _id: groupId },
      { $addToSet: { channels: channel } }
    );

    res.json({ success: true, message: `Channel '${channel}' added.` });
  } catch (err) {
    console.error("❌ Failed to add channel:", err);
    res.status(500).json({ error: "Failed to add channel" });
  }
});

/* ------------------------------------------------------------------
   ➖ REMOVE CHANNEL
------------------------------------------------------------------ */
router.delete("/:id/channels/:channel", async (req, res) => {
  try {
    const db = getDb();
    const { id, channel } = req.params;
    if (!channel) return res.status(400).json({ error: "Missing channel name" });

    await db.collection("groups").updateOne(
      { _id: new ObjectId(id) },
      { $pull: { channels: channel } }
    );

    res.json({ success: true, message: `Channel '${channel}' removed.` });
  } catch (err) {
    console.error("❌ Failed to remove channel:", err);
    res.status(500).json({ error: "Failed to remove channel" });
  }
});

/* ------------------------------------------------------------------
   🗑️ DELETE GROUP
------------------------------------------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const result = await db.collection("groups").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Group not found" });

    res.json({ success: true, message: "Group deleted successfully." });
  } catch (err) {
    console.error("❌ Failed to delete group:", err);
    res.status(500).json({ error: "Failed to delete group" });
  }
});

/* ------------------------------------------------------------------
   🚫 BAN USER
------------------------------------------------------------------ */
router.post("/:id/ban", async (req, res) => {
  try {
    const db = getDb();
    const { channel, username, reason, bannedBy } = req.body;

    if (!username || !channel)
      return res.status(400).json({ error: "Missing username or channel" });

    const groupId = new ObjectId(req.params.id);
    await db.collection("bans").insertOne({
      groupId,
      channel,
      username,
      reason: reason || "No reason provided",
      bannedBy: bannedBy || "Unknown",
      timestamp: new Date(),
    });

    res.json({ success: true, message: `${username} has been banned.` });
  } catch (err) {
    console.error("❌ Failed to ban user:", err);
    res.status(500).json({ error: "Failed to ban user" });
  }
});

export default router;
