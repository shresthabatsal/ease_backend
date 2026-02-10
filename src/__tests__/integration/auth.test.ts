import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth Integration Tests", () => {
  const user = {
    fullName: "Auth Test",
    email: "auth@test.com",
    password: "password123",
    phoneNumber: "9811111111",
  };

  let token: string;

  beforeAll(async () => {
    await UserModel.deleteMany({ email: user.email });
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: user.email });
  });

  it("should register a user", async () => {
    const res = await request(app).post("/api/auth/register").send(user);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(user.email);
  });

  it("should not register user with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "invalid@test.com" });

    expect(res.status).toBe(400);
  });

  it("should login user and return token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.email).toBe(user.email);

    token = res.body.token;
  });

  it("should not login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: user.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  it("should not login with non-existing email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nouser@test.com",
      password: "password123",
    });

    expect(res.status).toBe(404);
  });

  it("should get user profile", async () => {
    const res = await request(app)
      .get("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });

  it("should not get profile without token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  it("should update profile", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.fullName).toBe("Updated Name");
  });

  it("should not update profile without token", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .send({ fullName: "Fail Update" });

    expect(res.status).toBe(401);
  });

  it("should upload profile picture", async () => {
    const res = await request(app)
      .post("/api/auth/upload-profile-picture")
      .set("Authorization", `Bearer ${token}`)
      .attach(
        "profilePicture",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(res.status).toBe(200);
    expect(res.body.data).toContain("/uploads");
  });

  it("should fail upload profile picture without file", async () => {
    const res = await request(app)
      .post("/api/auth/upload-profile-picture")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("should request password reset email", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({ email: user.email });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should request password reset even if email does not exist", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({ email: "ghost@test.com" });

    expect(res.status).toBe(200);
  });

  it("should delete user account", async () => {
    const res = await request(app)
      .delete("/api/auth/delete-account")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
