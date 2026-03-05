import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { CartModel } from "../../models/cart.model";

describe("Cart Integration Tests", () => {
  const testUser = {
    fullName: "Cart Test User",
    email: "carttest@test.com",
    password: "password123",
    phoneNumber: "9811333444",
  };

  let userToken: string;
  let userId: string;
  let adminToken: string;
  let productId: string;
  let storeId: string;
  let categoryId: string;
  let subcategoryId: string;
  let cartItemId: string;

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });

    const reg = await request(app).post("/api/auth/register").send(testUser);
    userId = reg.body.data._id;

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    userToken = login.body.token;

    const admin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@gmail.com", password: "pass123" });
    adminToken = admin.body.token;

    const storeRes = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("storeName", "Cart Test Store")
      .field("location", "Thamel")
      .field("coordinates[latitude]", "27.715")
      .field("coordinates[longitude]", "85.314")
      .field("pickupInstructions", "Show OTP");
    storeId = storeRes.body.data._id;

    const catRes = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Cart Test Category" });
    categoryId = catRes.body.data._id;

    const subRes = await request(app)
      .post("/api/admin/subcategories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Cart Test Subcategory", categoryId });
    subcategoryId = subRes.body.data._id;

    const prodRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Cart Test Product")
      .field("price", "200")
      .field("quantity", "10")
      .field("description", "For cart tests")
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
    await CartModel.deleteMany({ userId });
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
    await UserModel.deleteMany({ email: testUser.email });
  });

  // Get cart
  it("should get empty cart", async () => {
    const res = await request(app)
      .get("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(0);
    expect(res.body.data.totalPrice).toBe(0);
    expect(res.body.data.itemCount).toBe(0);
  });

  // Add to cart
  it("should add item to cart", async () => {
    const res = await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.data.productId).toBeDefined();
    expect(res.body.data.quantity).toBe(2);
    cartItemId = res.body.data._id;
  });

  it("should accumulate quantity when adding same product again", async () => {
    const res = await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });

    expect(res.status).toBe(201);
    expect(res.body.data.quantity).toBe(3);
  });

  it("should not add item with quantity 0", async () => {
    const res = await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 0 });
    expect(res.status).toBe(400);
  });

  it("should not add item exceeding stock", async () => {
    const res = await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 9999 });
    expect(res.status).toBe(400);
  });

  it("should not add non-existing product", async () => {
    const res = await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId: "64b000000000000000000000", quantity: 1 });
    expect(res.status).toBe(404);
  });

  // Update cart item
  it("should update cart item quantity", async () => {
    const res = await request(app)
      .put(`/api/user/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.quantity).toBe(5);
  });

  it("should not update cart item with quantity 0", async () => {
    const res = await request(app)
      .put(`/api/user/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ quantity: 0 });
    expect(res.status).toBe(400);
  });

  it("should not update another user's cart item", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Other",
      email: "other_cart@test.com",
      password: "password123",
      phoneNumber: "9800011111",
    });
    const other = await request(app)
      .post("/api/auth/login")
      .send({ email: "other_cart@test.com", password: "password123" });
    const otherToken = other.body.token;

    const res = await request(app)
      .put(`/api/user/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(403);
    await UserModel.deleteMany({ email: "other_cart@test.com" });
  });

  // Remove from cart
  it("should remove item from cart", async () => {
    const res = await request(app)
      .delete(`/api/user/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });

  it("should not remove already removed item", async () => {
    const res = await request(app)
      .delete(`/api/user/cart/${cartItemId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  // Clear cart
  it("should clear entire cart", async () => {
    await request(app)
      .post("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ productId, quantity: 1 });

    const res = await request(app)
      .delete("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);

    const cart = await request(app)
      .get("/api/user/cart")
      .set("Authorization", `Bearer ${userToken}`);
    expect(cart.body.data.itemCount).toBe(0);
  });
});
