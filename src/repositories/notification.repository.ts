import { NotificationModel, INotification } from "../models/notification.model";

export interface INotificationRepository {
  createNotification(data: Partial<INotification>): Promise<INotification>;
  getNotificationById(id: string): Promise<INotification | null>;
  getUserNotifications(
    userId: string,
    limit?: number
  ): Promise<INotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<boolean>;
  deleteNotification(id: string): Promise<boolean>;
}

export class NotificationRepository implements INotificationRepository {
  async createNotification(
    data: Partial<INotification>
  ): Promise<INotification> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  async getNotificationById(id: string): Promise<INotification | null> {
    return await NotificationModel.findById(id)
      .populate("userId")
      .populate("orderId");
  }

  async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<INotification[]> {
    return await NotificationModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("orderId");
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      userId,
      isRead: false,
    });
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return await NotificationModel.findByIdAndUpdate(
      id,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result.modifiedCount > 0;
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(id);
    return !!result;
  }
}
