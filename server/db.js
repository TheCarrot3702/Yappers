// server/db.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

export async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGO_DB);
    console.log(`✅ Connected to MongoDB db="${process.env.MONGO_DB}"`);
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error("❌ MongoDB not connected yet!");
  return db;
}
