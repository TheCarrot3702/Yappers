// ============================================================
// 🧠 MongoDB Connection Utility
// ------------------------------------------------------------
// This module handles connecting to MongoDB and provides
// a shared database reference for the rest of the application.
// ============================================================

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a new MongoDB client instance using the connection URI
const client = new MongoClient(process.env.MONGO_URI);

// Hold a single database reference to avoid multiple connections
let db;

/**
 * 🧩 Connects to the MongoDB database (singleton pattern).
 * - Uses environment variables for connection string and database name.
 * - Ensures the database connection is established only once.
 *
 * @returns {Promise<import("mongodb").Db>} The connected MongoDB database instance.
 */
export async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGO_DB);
    console.log(`✅ Connected to MongoDB db="${process.env.MONGO_DB}"`);
  }
  return db;
}

/**
 * 🔍 Retrieves the active MongoDB database connection.
 * - Throws an error if `connectMongo()` was not called before use.
 *
 * @throws {Error} If the database connection has not been established.
 * @returns {import("mongodb").Db} The active MongoDB database instance.
 */
export function getDb() {
  if (!db) throw new Error("❌ MongoDB not connected yet!");
  return db;
}
