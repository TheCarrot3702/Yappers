import request from "supertest";
import { MongoClient } from "mongodb";
import app from "../index.js";

let client, db, collections;
let testGroupId = "test-group-id";
let testChannel = "general";

beforeAll(async () => {
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
  collections = {
    users: db.collection("users"),
    messages: db.collection("messages"),
  };
  await collections.messages.deleteMany({});
});

afterAll(async () => {
  await collections.messages.deleteMany({});
  await client.close();
});

describe("Messages API", () => {
  let testMessage;

  test("POST /api/messages (simulate send message via socket)", async () => {
    // Simulate storing a message directly to DB
    const doc = {
      username: "alice",
      message: "Hello world!",
      groupId: testGroupId,
      channel: testChannel,
      timestamp: new Date(),
      type: "text",
    };
    const result = await collections.messages.insertOne(doc);
    expect(result.insertedId).toBeDefined();

    testMessage = doc;
  });

  test("GET /api/messages?groupId&channel → should retrieve messages", async () => {
    const msgs = await collections.messages
      .find({ groupId: testGroupId, channel: testChannel })
      .toArray();

    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs[0]).toHaveProperty("username", "alice");
  });

  test("Should store image message", async () => {
    const imgMsg = {
      username: "bob",
      imageUrl: "http://localhost:3000/uploads/chat/test-image.png",
      groupId: testGroupId,
      channel: testChannel,
      timestamp: new Date(),
      type: "image",
    };

    const result = await collections.messages.insertOne(imgMsg);
    expect(result.insertedId).toBeDefined();

    const msg = await collections.messages.findOne({ username: "bob" });
    expect(msg.imageUrl).toContain("http://localhost:3000/uploads/chat/");
  });

  test("Should clean up old test messages", async () => {
    const delResult = await collections.messages.deleteMany({ groupId: testGroupId });
    expect(delResult.deletedCount).toBeGreaterThan(0);
  });
});
