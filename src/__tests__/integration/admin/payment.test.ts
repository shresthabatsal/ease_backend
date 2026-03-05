import request from "supertest";
import app from "../../../app";
import { UserModel } from "../../../models/user.model";
import { OrderModel } from "../../../models/order.model";
import { PaymentModel } from "../../../models/payment.model";

describe("Admin Orders & Payments Integration Tests", () => {
  jest.setTimeout(30000);

  const testUser = {
    fullName: "Admin Orders Test User",
    email: "adminorderstest@test.com",
    password: "password123",
    phoneNumber: "9811777888",
  };

  let adminToken: string;
  let userToken: string;
  let userId: string;
  let storeId: string;
  let categoryId: string;
  let subcategoryId: string;
  let productId: string;
  let orderId: string;
  let paymentId: string;

  const futureDate = new Date(Date.now() + 86400000)
    .toISOString()
    .split("T")[0];

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

    // Setup fixtures
    const storeRes = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("storeName", "Admin Orders Store")
      .field("location", "Patan")
      .field("coordinates[latitude]", "27.6736")
      .field("coordinates[longitude]", "85.3157")
      .field("pickupInstructions", "Show OTP");
    if (!storeRes.body.data?._id)
      throw new Error(`Store setup failed: ${JSON.stringify(storeRes.body)}`);
    storeId = storeRes.body.data._id;

    const catRes = await request(app)
      .post("/api/admin/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Admin Orders Category" });
    if (!catRes.body.data?._id)
      throw new Error(`Category setup failed: ${JSON.stringify(catRes.body)}`);
    categoryId = catRes.body.data._id;

    const subRes = await request(app)
      .post("/api/admin/subcategories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Admin Orders Subcategory", categoryId });
    if (!subRes.body.data?._id)
      throw new Error(
        `Subcategory setup failed: ${JSON.stringify(subRes.body)}`
      );
    subcategoryId = subRes.body.data._id;

    const prodRes = await request(app)
      .post("/api/admin/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", "Admin Orders Product")
      .field("price", "400")
      .field("quantity", "50")
      .field("description", "For admin order tests")
      .field("storeId", storeId)
      .field("categoryId", categoryId)
      .field("subcategoryId", subcategoryId)
      .attach(
        "productImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );
    if (!prodRes.body.data?._id)
      throw new Error(`Product setup failed: ${JSON.stringify(prodRes.body)}`);
    productId = prodRes.body.data._id;

    // Place an order as user
    const orderRes = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 1,
        storeId,
        pickupDate: futureDate,
        pickupTime: "14:00",
      });
    if (!orderRes.body.data?._id)
      throw new Error(`Order setup failed: ${JSON.stringify(orderRes.body)}`);
    orderId = orderRes.body.data._id;
  });

  afterAll(async () => {
    await PaymentModel.deleteMany({ userId });
    await OrderModel.deleteMany({ userId });
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

  it("should get orders by store", async () => {
    const res = await request(app)
      .get(`/api/admin/orders/stores/${storeId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((o: any) => o._id === orderId)).toBe(true);
  });

  it("should get order by id", async () => {
    const res = await request(app)
      .get(`/api/admin/orders/${orderId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(orderId);
    expect(res.body.data.status).toBe("PENDING");
    expect(res.body.data.pickupCode).toBeDefined();
  });

  it("should update order status to READY_FOR_COLLECTION", async () => {
    const res = await request(app)
      .put(`/api/admin/orders/${orderId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "READY_FOR_COLLECTION" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("READY_FOR_COLLECTION");
  });

  it("should fail OTP verify with wrong OTP", async () => {
    const res = await request(app)
      .post(`/api/admin/orders/${orderId}/verify-otp`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ otp: "000000" });

    expect(res.status).toBe(400);
  });

  it("should submit payment receipt as user", async () => {
    const orderRes = await request(app)
      .post("/api/user/orders/buy-now")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        productId,
        quantity: 1,
        storeId,
        pickupDate: futureDate,
        pickupTime: "16:00",
      });
    const payableOrderId = orderRes.body.data._id;

    const payRes = await request(app)
      .post("/api/user/payments/submit-receipt")
      .set("Authorization", `Bearer ${userToken}`)
      .field("orderId", payableOrderId)
      .field("paymentMethod", "eSewa")
      .attach(
        "receiptImage",
        "uploads/users/0d14c1e9-92de-4769-90d5-5b7cc51b1856-aisle.jpg"
      );

    expect(payRes.status).toBe(201);
    expect(payRes.body.data.status).toBe("PENDING");
    expect(payRes.body.data.receiptImage).toContain("/uploads");
    paymentId = payRes.body.data._id;
  });

  it("should get all payments as admin", async () => {
    const res = await request(app)
      .get("/api/admin/payments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it("should get all payments filtered by PENDING status", async () => {
    const res = await request(app)
      .get("/api/admin/payments?status=PENDING")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => p.status === "PENDING")).toBe(true);
  });

  it("should get payment by id", async () => {
    const res = await request(app)
      .get(`/api/admin/payments/${paymentId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(paymentId);
    expect(res.body.data.status).toBe("PENDING");
  });

  it("should verify payment and confirm order with OTP", async () => {
    const res = await request(app)
      .put(`/api/admin/payments/${paymentId}/verify`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "VERIFIED", verificationNotes: "Looks good" });

    expect(res.status).toBe(200);
    expect(res.body.data.payment.status).toBe("VERIFIED");
    expect(res.body.data.order.status).toBe("CONFIRMED");
    expect(res.body.data.order.otp).toBeDefined();
  });
});
