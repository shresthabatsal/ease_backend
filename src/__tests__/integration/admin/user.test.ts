import request from "supertest";
import app from "../../../app";

describe("Admin User Integration Tests", () => {
  let adminToken: string;
  let userId: string;
  let normalUserToken: string;

  beforeAll(async () => {
    // Admin login
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "admin@gmail.com",
      password: "pass123",
    });

    adminToken = adminRes.body.token;

    // Normal user login
    const userRes = await request(app).post("/api/auth/login").send({
      email: "auth@test.com",
      password: "password123",
    });

    normalUserToken = userRes.body.token;
  });

  it("should create user with profile picture", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("fullName", "Admin User")
      .field("email", "adminuser@test.com")
      .field("password", "password123")
      .field("phoneNumber", "9800000000")
      .attach(
        "profilePicture",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("adminuser@test.com");

    userId = res.body.data._id;
  });

  it("should get all users with pagination", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&size=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it("should fail when normal user accesses admin routes", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${normalUserToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should get user by id", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(userId);
  });

  it("should fail to get user with invalid id", async () => {
    const res = await request(app)
      .get("/api/admin/users/invalid-id")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });

  it("should update user", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fullName: "Updated Admin User" });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Updated Admin User");
  });

  it("should not update non-existing user", async () => {
    const res = await request(app)
      .put("/api/admin/users/64b000000000000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fullName: "No User" });

    expect(res.status).toBe(404);
  });

  it("should delete user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it("should not delete already deleted user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${userId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("should not access admin route without token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("should reject access with an invalid admin token", async () => {
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.payload";

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
