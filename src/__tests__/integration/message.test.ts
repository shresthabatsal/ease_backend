import request from "supertest";

jest.setTimeout(30000);
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { MessageModel } from "../../models/message.model";
import { createServer } from "http";
import { WebSocketService } from "../../services/websocket.service";

describe("Message Integration Tests", () => {
  const testUser = {
    fullName: "Message Test User",
    email: "messagetest@test.com",
    password: "password123",
    phoneNumber: "9811555666",
  };

  let userToken: string;
  let userId: string;
  let adminToken: string;
  let ticketId: string;
  let httpServer: ReturnType<typeof createServer>;

  beforeAll(async () => {
    // Initialize WebSocketService so getWebSocketService() doesn't throw
    httpServer = createServer(app);
    new WebSocketService(httpServer);

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

    const ticketRes = await request(app)
      .post("/api/support/tickets")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        title: "Message Test Ticket",
        description: "For message tests",
        category: "BUG",
        priority: "LOW",
      });
    ticketId = ticketRes.body.data._id;
  });

  afterAll(async () => {
    await MessageModel.deleteMany({ senderId: userId });
    await request(app)
      .put(`/api/support/tickets/${ticketId}/close`)
      .set("Authorization", `Bearer ${userToken}`);
    await UserModel.deleteMany({ email: testUser.email });
    httpServer.close();
  });

  // Send message
  it("should send a message to a ticket", async () => {
    const res = await request(app)
      .post("/api/support/messages")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ticketId, message: "Hello, I need help with this issue." });

    expect(res.status).toBe(201);
    expect(res.body.data.message).toBe("Hello, I need help with this issue.");
    expect(res.body.data.ticketId).toBe(ticketId);
    expect(res.body.data.senderRole).toBe("USER");
  });

  it("should send an admin reply to the same ticket", async () => {
    const res = await request(app)
      .post("/api/support/messages")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ticketId, message: "We are looking into this for you." });

    expect(res.status).toBe(201);
    expect(res.body.data.senderRole).toBe("ADMIN");
  });

  it("should not send message without token", async () => {
    const res = await request(app)
      .post("/api/support/messages")
      .send({ ticketId, message: "Anonymous" });
    expect(res.status).toBe(401);
  });

  it("should not send message without ticketId", async () => {
    const res = await request(app)
      .post("/api/support/messages")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ message: "No ticket" });
    expect(res.status).toBe(400);
  });

  it("should not send message to non-existing ticket", async () => {
    const res = await request(app)
      .post("/api/support/messages")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ ticketId: "64b000000000000000000000", message: "Ghost ticket" });
    expect(res.status).toBe(404);
  });

  // Get messages
  it("should get all messages for a ticket", async () => {
    const res = await request(app)
      .get(`/api/support/messages/${ticketId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});
