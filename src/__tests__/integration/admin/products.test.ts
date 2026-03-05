import request from "supertest";
import app from "../../../app";

describe("Admin Products Integration Tests", () => {
  let adminToken: string;
  let normalUserToken: string;
  let storeId: string;
  let categoryId: string;
  let subcategoryId: string;
  let productId: string;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@gmail.com", password: "pass123" });
    adminToken = adminRes.body.token;

    const userRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "auth@test.com", password: "password123" });
    normalUserToken = userRes.body.token;

    const storeRes = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("storeName", "Products Test Store")
      .field("location", "Lalitpur")
      .field("coordinates[latitude]", "27.6736")
      .field("coordinates[longitude]", "85.3157")
      .field("pickupInstructions", "Show OTP");
    storeId = storeRes.body.data._id;

    const catRes = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Products Test Category" });
    categoryId = catRes.body.data._id;

    const subRes = await request(app)
      .post("/api/admin/subcategories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Products Test Subcategory", categoryId });
    subcategoryId = subRes.body.data._id;
  });

  afterAll(async () => {
    if (productId) {
      await request(app)
        .delete(`/api/admin/products/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`);
    }
    await request(app)
      .delete(`/api/admin/subcategories/${subcategoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("should create a product with image", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Integration Product")
      .field("price", "499")
      .field("quantity", "25")
      .field("description", "Product for integration testing")
      .field("storeId", storeId)
      .field("categoryId", categoryId)
      .field("subcategoryId", subcategoryId)
      .attach(
        "productImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Integration Product");
    expect(res.body.data.price).toBe(499);
    expect(res.body.data.quantity).toBe(25);
    expect(res.body.data.productImage).toContain("/uploads");
    expect(res.body.data.storeId._id ?? res.body.data.storeId).toBeDefined();
    productId = res.body.data._id;
  });

  it("should not create product without image", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "No Image Product")
      .field("price", "100")
      .field("quantity", "5")
      .field("description", "Missing image")
      .field("storeId", storeId)
      .field("categoryId", categoryId)
      .field("subcategoryId", subcategoryId);

    expect(res.status).toBe(400);
  });

  it("should not create product with missing required fields", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Incomplete" });

    expect(res.status).toBe(400);
  });

  it("should not create product with invalid storeId", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Bad Store Product")
      .field("price", "100")
      .field("quantity", "5")
      .field("description", "Bad store")
      .field("storeId", "64b000000000000000000000")
      .field("categoryId", categoryId)
      .field("subcategoryId", subcategoryId)
      .attach(
        "productImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(res.status).toBe(404);
  });

  it("should not create product as normal user", async () => {
    const res = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${normalUserToken}`)
      .send({ name: "Unauthorized" });

    expect(res.status).toBe(401);
  });

  it("should get all products with pagination", async () => {
    const res = await request(app)
      .get("/api/admin/products?page=1&size=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.size).toBe(10);
  });

  it("should get products with search filter", async () => {
    const res = await request(app)
      .get("/api/admin/products?search=Integration")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.some((p: any) => p._id === productId)).toBe(true);
  });

  it("should get products by store", async () => {
    const res = await request(app)
      .get(`/api/admin/products/store/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((p: any) => p._id === productId)).toBe(true);
  });

  it("should update product price and quantity", async () => {
    const res = await request(app)
      .put(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ price: 599, quantity: 30 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(599);
    expect(res.body.data.quantity).toBe(30);
  });

  it("should delete product", async () => {
    const res = await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    productId = "";
  });
});
