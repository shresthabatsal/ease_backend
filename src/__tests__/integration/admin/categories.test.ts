import request from "supertest";
import app from "../../../app";

describe("Admin Categories Integration Tests", () => {
  let adminToken: string;
  let normalUserToken: string;
  let categoryId: string;

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

  it("should create a category with image", async () => {
    const res = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Integration Category")
      .attach(
        "categoryImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Integration Category");
    expect(res.body.data.categoryImage).toContain("/uploads");
    categoryId = res.body.data._id;
  });

  it("should not create category without name", async () => {
    const res = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("should not create category as normal user", async () => {
    const res = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${normalUserToken}`)
      .send({ name: "Unauthorized" });

    expect(res.status).toBe(401);
  });

  it("should get all categories", async () => {
    const res = await request(app)
      .get("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((c: any) => c._id === categoryId)).toBe(true);
  });

  it("should get category by id", async () => {
    const res = await request(app)
      .get(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(categoryId);
    expect(res.body.data.name).toBe("Integration Category");
  });

  it("should update category name", async () => {
    const res = await request(app)
      .put(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Integration Category" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Integration Category");
  });

  it("should delete category", async () => {
    const res = await request(app)
      .delete(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("should return 404 when deleting already deleted category", async () => {
    const res = await request(app)
      .delete(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
