const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', async (req, res) => {
  const groups = await getDb().collection('groups').find().toArray();
  res.json(groups);
});

// expects: { name, ownerUsername, channels:[], members:[], joinRequests:[] }
router.post('/', async (req, res) => {
  const body = req.body || {};
  const group = {
    id: body.id || crypto.randomUUID(),
    name: body.name,
    ownerUsername: body.ownerUsername,
    channels: body.channels || ['General'],
    members: body.members || [],
    joinRequests: body.joinRequests || []
  };
  await getDb().collection('groups').insertOne(group);
  res.status(201).json(group);
});

router.post('/:id/channels', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await getDb().collection('groups').updateOne(
    { id },
    { $addToSet: { channels: name } }
  );
  const g = await getDb().collection('groups').findOne({ id });
  res.json(g);
});

router.post('/:id/join-requests', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  await getDb().collection('groups').updateOne(
    { id },
    { $addToSet: { joinRequests: username } }
  );
  res.json({ ok: true });
});

router.post('/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  const col = getDb().collection('groups');
  await col.updateOne(
    { id },
    { $pull: { joinRequests: username }, $addToSet: { members: username } }
  );
  const g = await col.findOne({ id });
  res.json(g);
});

router.post('/:id/reject', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  await getDb().collection('groups').updateOne(
    { id },
    { $pull: { joinRequests: username } }
  );
  res.json({ ok: true });
});

router.post('/:id/remove-member', async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;
  await getDb().collection('groups').updateOne(
    { id },
    { $pull: { members: username } }
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await getDb().collection('groups').deleteOne({ id });
  res.sendStatus(204);
});

module.exports = router;
