import { Router } from "express";
import { AdminOrderController } from "../../controllers/admin/order.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middleware/auth.middleware";

const router = Router();
const adminOrderController = new AdminOrderController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/stores/:storeId", (req, res, next) =>
  adminOrderController.getStoreOrders(req, res, next)
);
router.get("/stores/:storeId/status/:status", (req, res, next) =>
  adminOrderController.getOrdersByStatus(req, res, next)
);
router.put("/:orderId/status", (req, res, next) =>
  adminOrderController.updateOrderStatus(req, res, next)
);
router.post("/:orderId/verify-otp", (req, res, next) =>
  adminOrderController.verifyOtpAndCollect(req, res, next)
);
router.delete("/:orderId", (req, res, next) =>
  adminOrderController.deleteOrder(req, res, next)
);
router.get("/:orderId", (req, res, next) =>
  adminOrderController.getOrder(req, res, next)
);

export default router;
