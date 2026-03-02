import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await notificationService.getUserNotifications(
        req.user!._id.toString(),
        limit
      );

      return res.status(200).json({
        success: true,
        message: "Notifications retrieved",
        data: notifications,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(
        req.user!._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "Unread count retrieved",
        data: { unreadCount: count },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.notificationId
      );

      return res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!._id.toString());

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteNotification(req.params.notificationId);

      return res.status(200).json({
        success: true,
        message: "Notification deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
