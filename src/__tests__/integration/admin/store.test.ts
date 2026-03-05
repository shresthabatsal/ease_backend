import request from "supertest";
import app from "../../../app";

describe("Admin Stores Integration Tests", () => {
  let adminToken: string;
  let normalUserToken: string;
  let storeId: string;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@gmail.com", password: "pass123" });
    adminToken = adminRes.body.token;

    const userRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "auth@test.com", password: "password123" });
    normalUserToken = userRes.body.token;
  });

  it("should create a store with image and QR", async () => {
    const res = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("storeName", "Integration Store")
      .field("location", "Thamel, Kathmandu")
      .field("coordinates[latitude]", "27.71500")
      .field("coordinates[longitude]", "85.31400")
      .field("pickupInstructions", "Show OTP at front desk")
      .attach(
        "storeImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      )
      .attach(
        "paymentQRCode",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(res.status).toBe(201);
    expect(res.body.data.storeName).toBe("Integration Store");
    expect(res.body.data.coordinates.latitude).toBe(27.715);
    expect(res.body.data.storeImage).toContain("/uploads");
    expect(res.body.data.paymentQRCode).toContain("/uploads");
    storeId = res.body.data._id;
  });

  it("should not create store with missing required fields", async () => {
    const res = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ storeName: "Incomplete" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should get all stores", async () => {
    const res = await request(app)
      .get("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((s: any) => s._id === storeId)).toBe(true);
  });

  it("should get store by id", async () => {
    const res = await request(app)
      .get(`/api/admin/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(storeId);
    expect(res.body.data.coordinates).toBeDefined();
    expect(res.body.data.pickupInstructions).toBeDefined();
  });

  it("should return 404 for non-existing store", async () => {
    const res = await request(app)
      .get("/api/admin/stores/64b000000000000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it("should update store name and instructions", async () => {
    const res = await request(app)
      .put(`/api/admin/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        storeName: "Updated Integration Store",
        pickupInstructions: "New instructions",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.storeName).toBe("Updated Integration Store");
    expect(res.body.data.pickupInstructions).toBe("New instructions");
  });

  it("should delete store", async () => {
    const res = await request(app)
      .delete(`/api/admin/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
