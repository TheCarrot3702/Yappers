import request from "supertest";
import { MongoClient } from "mongodb";
import app from "../index.js";

let client, db;

beforeAll(async () => {
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
});

afterAll(async () => {
  await client.close();
});

describe("Groups API", () => {
  let createdId;

  test("POST /api/groups → create group", async () => {
    const res = await request(app)
      .post("/api/groups")
      .send({ name: "Test Group", ownerUsername: "tester" });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("Test Group");
    createdId = res.body._id;
  });

  test("GET /api/groups → list groups", async () => {
    const res = await request(app).get("/api/groups");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/groups/:id/channels → add channel", async () => {
    const res = await request(app)
      .post(`/api/groups/${createdId}/channels`)
      .send({ name: "general" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/groups/:id → delete group", async () => {
    const res = await request(app).delete(`/api/groups/${createdId}`);
    expect(res.statusCode).toBe(200);
  });
});
