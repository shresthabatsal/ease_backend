import { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from "http";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();

// Store active user connections
const userConnections: Map<string, string[]> = new Map();

export class WebSocketService {
  private io: SocketIOServer;

  constructor(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:3003",
          "http://localhost:3005",
        ],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const userId = socket.handshake.query.userId as string;
      if (!userId) {
        return next(new Error("Missing userId"));
      }
      socket.data.userId = userId;
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.userId;

      // Add user to connections
      if (!userConnections.has(userId)) {
        userConnections.set(userId, []);
      }
      userConnections.get(userId)!.push(socket.id);

      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Join user to a room named after their userId
      socket.join(`user_${userId}`);

      // Handle disconnect
      socket.on("disconnect", () => {
        const sockets = userConnections.get(userId) || [];
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        console.log(`User ${userId} disconnected`);
      });

      // Mark notification as read
      socket.on("mark_as_read", async (notificationId: string) => {
        try {
          await notificationService.markAsRead(notificationId);
          socket.emit("notification_marked", { notificationId });
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      });

      // Get unread count
      socket.on("get_unread_count", async () => {
        try {
          const count = await notificationService.getUnreadCount(userId);
          socket.emit("unread_count", { count });
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      });
    });
  }

  // Send notification to specific user
  async sendNotificationToUser(
    userId: string,
    type: string,
    title: string,
    message: string,
    orderId: string,
    data?: any
  ) {
    // Create notification in database
    const notification = await notificationService.createNotification(
      userId,
      orderId,
      type,
      title,
      message,
      data
    );

    // Send via WebSocket
    this.io.to(`user_${userId}`).emit("notification_received", {
      _id: notification._id,
      type,
      title,
      message,
      orderId,
      data,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  // Send notification to admin/store users
  async sendNotificationToStoreAdmins(
    storeId: string,
    userIds: string[],
    type: string,
    title: string,
    message: string,
    orderId: string,
    data?: any
  ) {
    for (const userId of userIds) {
      await this.sendNotificationToUser(
        userId,
        type,
        title,
        message,
        orderId,
        data
      );
    }
  }

  getIO() {
    return this.io;
  }
}
