import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { NotificationModel } from "../../models/notification.model";
import { OrderModel } from "../../models/order.model";
import mongoose from "mongoose";

describe("Notification Integration Tests", () => {
  const testUser = {
    fullName: "Notification Test User",
    email: "notiftest@test.com",
    password: "password123",
    phoneNumber: "9811666777",
  };

  let userToken: string;
  let userId: string;
  let adminToken: string;
  let notificationId: string;

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

    const fakeOrderId = new mongoose.Types.ObjectId();
    const notification = await NotificationModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: fakeOrderId,
      type: "ORDER_CREATED",
      title: "Order Created 📦",
      message: "Your test order was created.",
      isRead: false,
    });
    notificationId = notification._id.toString();
  });

  afterAll(async () => {
    await NotificationModel.deleteMany({ userId });
    await UserModel.deleteMany({ email: testUser.email });
  });

  it("should not access notifications without token", async () => {
    const res = await request(app).get("/api/user/notification");
    expect(res.status).toBe(401);
  });

  // Get notifications
  it("should get user notifications", async () => {
    const res = await request(app)
      .get("/api/user/notification")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((n: any) => n._id === notificationId)).toBe(true);
  });

  it("should get unread count", async () => {
    const res = await request(app)
      .get("/api/user/notification/unread/count")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.unreadCount).toBeGreaterThanOrEqual(1);
  });

  // Mark as read
  it("should mark a notification as read", async () => {
    const res = await request(app)
      .put(`/api/user/notification/${notificationId}/read`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    const fakeOrderId = new mongoose.Types.ObjectId();
    await NotificationModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: fakeOrderId,
      type: "ORDER_CONFIRMED",
      title: "Order Confirmed",
      message: "Your order was confirmed.",
      isRead: false,
    });

    const res = await request(app)
      .put("/api/user/notification/mark-all/read")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);

    const countRes = await request(app)
      .get("/api/user/notification/unread/count")
      .set("Authorization", `Bearer ${userToken}`);
    expect(countRes.body.data.unreadCount).toBe(0);
  });

  // Delete notification
  it("should delete a notification", async () => {
    const res = await request(app)
      .delete(`/api/user/notification/${notificationId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(200);
  });
});
