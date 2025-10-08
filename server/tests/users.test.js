import request from "supertest";
import { MongoClient } from "mongodb";
import { app } from '../index.js';

let client, db, users;

beforeAll(async () => {
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
  users = db.collection("users");
  await users.deleteMany({});
});

afterAll(async () => {
  await users.deleteMany({});
  await client.close();
});

describe("Users API", () => {
  let createdId;

  test("POST /api/upload/avatar → should upload avatar and update user", async () => {
    // Simulate an avatar upload by sending username param
    const username = "testuser";

    const res = await request(app)
      .post("/api/upload/avatar")
      .field("username", username)
      .attach("file", Buffer.from("fakeimagecontent"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("url");

    const user = await users.findOne({ username });
    expect(user).toBeTruthy();
    expect(user.avatarUrl).toContain("http://localhost:3000/uploads/avatars/");
  });

  test("GET /api/users → should list all users", async () => {
    const res = await request(app).get("/api/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("username", "testuser");
  });

  test("Should update avatar for existing user", async () => {
    const username = "testuser";
    const newUrl = "http://localhost:3000/uploads/avatars/new.png";
    await users.updateOne({ username }, { $set: { avatarUrl: newUrl } });

    const updated = await users.findOne({ username });
    expect(updated.avatarUrl).toBe(newUrl);
  });
});
