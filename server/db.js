const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/yappers';
let client, db;

async function connectMongo() {
  if (db) return db;
  client = new MongoClient(uri, { ignoreUndefined: true });
  await client.connect();
  db = client.db(); // default DB from URI
  // Collections (create indexes as needed)
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  await db.collection('groups').createIndex({ name: 1 });
  await db.collection('messages').createIndex({ groupId: 1, channel: 1, timestamp: 1 });
  return db;
}

function getDb() {
  if (!db) throw new Error('Mongo not connected yet');
  return db;
}

module.exports = { connectMongo, getDb };
