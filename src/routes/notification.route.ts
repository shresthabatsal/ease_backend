import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const notificationController = new NotificationController();

router.use(authorizedMiddleware);

// Get user notifications
router.get("/", (req, res, next) =>
  notificationController.getUserNotifications(req, res, next)
);

// Get unread count
router.get("/unread/count", (req, res, next) =>
  notificationController.getUnreadCount(req, res, next)
);

// Mark notification as read
router.put("/:notificationId/read", (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

// Mark all as read
router.put("/mark-all/read", (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);

// Delete notification
router.delete("/:notificationId", (req, res, next) =>
  notificationController.deleteNotification(req, res, next)
);

export default router;
