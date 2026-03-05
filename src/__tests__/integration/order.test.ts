import request from "supertest";
import app from "../../app";
import { OrderModel } from "../../models/order.model";
import { UserModel } from "../../models/user.model";

describe("Order Integration Tests", () => {
  const testUser = {
    fullName: "Order Test User",
    email: "ordertest@test.com",
    password: "password123",
    phoneNumber: "9811222333",
  };

  let userToken: string;
  let userId: string;
  let adminToken: string;

  let storeId: string;
  let categoryId: string;
  let subcategoryId: string;
  let productId: string;

  // Order IDs created during tests
  let buyNowOrderId: string;
  let cartOrderId: string;

  const futureDate = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];
  const pastDate = "2020-01-01";

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });

    // Register and login test user
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    userId = registerRes.body.data._id;

    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    userToken = loginRes.body.token;

    // Login as admin
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "admin@gmail.com",
      password: "pass123",
    });
    adminToken = adminRes.body.token;

    // Create store
    const storeRes = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("storeName", "Order Integration Store")
      .field("location", "Thamel, Kathmandu")
      .field("coordinates[latitude]", "27.71500")
      .field("coordinates[longitude]", "85.31400")
      .field("pickupInstructions", "Show OTP at the counter");
    storeId = storeRes.body.data._id;

    // Create category
    const catRes = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Order Integration Category" });
    categoryId = catRes.body.data._id;

    // Create subcategory
    const subRes = await request(app)
      .post("/api/admin/subcategories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Order Integration Subcategory", categoryId });
    subcategoryId = subRes.body.data._id;

    // Create product
    const prodRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Order Integration Product")
      .field("price", "500")
      .field("quantity", "20")
      .field("description", "Product used for order integration tests")
      .field("storeId", storeId)
      .field("categoryId", categoryId)
      .field("subcategoryId", subcategoryId)
      .attach(
        "productImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );
    productId = prodRes.body.data._id;
  });

  afterAll(async () => {
    // Clean up orders created by test user
    await OrderModel.deleteMany({ userId });

    // Clean up product/subcategory/category/store
    await request(app)
      .delete(`/api/admin/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/subcategories/${subcategoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/categories/${categoryId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    await request(app)
      .delete(`/api/admin/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Clean up test user
    await UserModel.deleteMany({ email: testUser.email });
  });

  // Buy Now
  it("should place a buy-now order successfully", async () => {
    const res = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 1,
        storeId,
        pickupDate: futureDate,
        pickupTime: "14:00",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe(userId);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.paymentStatus).toBe("PENDING");
    expect(res.body.data.pickupCode).toBeDefined();
    expect(res.body.data.totalAmount).toBeGreaterThan(0);

    buyNowOrderId = res.body.data._id;
  });

  it("should not place buy-now order with quantity of 0", async () => {
    const res = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 0,
        storeId,
        pickupDate: futureDate,
        pickupTime: "14:00",
      });

    expect(res.status).toBe(400);
  });

  it("should not place buy-now order with quantity exceeding stock", async () => {
    const res = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 9999,
        storeId,
        pickupDate: futureDate,
        pickupTime: "14:00",
      });

    expect(res.status).toBe(400);
  });

  it("should not place buy-now order with a past pickup date", async () => {
    const res = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 1,
        storeId,
        pickupDate: pastDate,
        pickupTime: "14:00",
      });

    expect(res.status).toBe(400);
  });

  it("should not place buy-now order with invalid pickupTime format", async () => {
    const res = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 1,
        storeId,
        pickupDate: futureDate,
        pickupTime: "2pm",
      });

    expect(res.status).toBe(400);
  });

  it("should reject notes longer than 500 characters", async () => {
    const res = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 1,
        storeId,
        pickupDate: futureDate,
        pickupTime: "16:00",
        notes: "x".repeat(501),
      });

    expect(res.status).toBe(400);
  });

  // Cart Order
  it("should place a cart order successfully", async () => {
    // Add item to cart first
    await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    const res = await request(app)
      .post("/api/user/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ storeId, pickupDate: futureDate, pickupTime: "15:00" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].quantity).toBe(2);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.pickupCode).toBeDefined();

    cartOrderId = res.body.data._id;
  });

  it("should not place cart order with empty cart", async () => {
    const res = await request(app)
      .post("/api/user/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ storeId, pickupDate: futureDate, pickupTime: "15:00" });

    expect(res.status).toBe(400);
  });

  it("should not place cart order with past pickup date", async () => {
    const res = await request(app)
      .post("/api/user/orders")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ storeId, pickupDate: pastDate, pickupTime: "15:00" });

    expect(res.status).toBe(400);
  });

  // Get Orders
  it("should get all orders for the logged-in user", async () => {
    const res = await request(app)
      .get("/api/user/orders")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Should include both orders created above
    const ids = res.body.data.map((o: any) => o._id);
    expect(ids).toContain(buyNowOrderId);
    expect(ids).toContain(cartOrderId);
  });

  it("should get a single order by id", async () => {
    const res = await request(app)
      .get(`/api/user/orders/${buyNowOrderId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(buyNowOrderId);
    expect(res.body.data.pickupCode).toBeDefined();
  });

  // Cancel Order
  it("should cancel a pending order successfully", async () => {
    const res = await request(app)
      .post(`/api/user/orders/${cartOrderId}/cancel`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ reason: "Changed my mind" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("CANCELLED");
  });
});
