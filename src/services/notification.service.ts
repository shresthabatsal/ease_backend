import mongoose from "mongoose";
import { NotificationRepository } from "../repositories/notification.repository";
import { HttpError } from "../errors/http.error";

const notificationRepository = new NotificationRepository();

export class NotificationService {
  async createNotification(
    userId: string,
    orderId: string,
    type: string,
    title: string,
    message: string,
    data?: any
  ) {
    return await notificationRepository.createNotification({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: new mongoose.Types.ObjectId(orderId),
      type: type as any,
      title,
      message,
      data,
    });
  }

  async getNotificationById(id: string) {
    const notification = await notificationRepository.getNotificationById(id);
    if (!notification) {
      throw new HttpError(404, "Notification not found");
    }
    return notification;
  }

  async getUserNotifications(userId: string, limit: number = 50) {
    return await notificationRepository.getUserNotifications(userId, limit);
  }

  async getUnreadCount(userId: string) {
    return await notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(id: string) {
    const notification = await notificationRepository.markAsRead(id);
    if (!notification) {
      throw new HttpError(404, "Notification not found");
    }
    return notification;
  }

  async markAllAsRead(userId: string) {
    return await notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: string) {
    const result = await notificationRepository.deleteNotification(id);
    if (!result) {
      throw new HttpError(404, "Notification not found");
    }
    return result;
  }
}
