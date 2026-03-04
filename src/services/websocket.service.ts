import { Server as SocketIOServer, Socket } from "socket.io";
import { Server } from "http";
import { NotificationService } from "./notification.service";

const notificationService = new NotificationService();
const userConnections: Map<string, string[]> = new Map();

let _instance: WebSocketService | null = null;

export function getWebSocketService(): WebSocketService {
  if (!_instance) throw new Error("WebSocketService not initialized yet");
  return _instance;
}

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

    _instance = this; // register singleton immediately

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket, next) => {
      const userId = socket.handshake.query.userId as string;
      if (!userId) return next(new Error("Missing userId"));
      socket.data.userId = userId;
      next();
    });
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.userId;

      if (!userConnections.has(userId)) userConnections.set(userId, []);
      userConnections.get(userId)!.push(socket.id);

      socket.join(`user_${userId}`);

      socket.on("disconnect", () => {
        const sockets = userConnections.get(userId) || [];
        const index = sockets.indexOf(socket.id);
        if (index > -1) sockets.splice(index, 1);
      });

      socket.on("mark_as_read", async (notificationId: string) => {
        try {
          await notificationService.markAsRead(notificationId);
          socket.emit("notification_marked", { notificationId });
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("get_unread_count", async () => {
        try {
          const count = await notificationService.getUnreadCount(userId);
          socket.emit("unread_count", { count });
        } catch (error: any) {
          socket.emit("error", { message: error.message });
        }
      });

      socket.on("join_ticket", (ticketId: string) => {
        socket.join(`ticket_${ticketId}`);
      });

      socket.on("leave_ticket", (ticketId: string) => {
        socket.leave(`ticket_${ticketId}`);
      });
    });
  }

  async sendNotificationToUser(
    userId: string,
    type: string,
    title: string,
    message: string,
    orderId: string,
    data?: any
  ) {
    const notification = await notificationService.createNotification(
      userId,
      orderId,
      type,
      title,
      message,
      data
    );

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
