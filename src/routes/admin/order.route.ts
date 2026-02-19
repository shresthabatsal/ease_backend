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

router.get("/stores/:storeId/orders", (req, res, next) =>
  adminOrderController.getStoreOrders(req, res, next)
);
router.get("/stores/:storeId/orders/status/:status", (req, res, next) =>
  adminOrderController.getOrdersByStatus(req, res, next)
);
router.put("/orders/:orderId/status", (req, res, next) =>
  adminOrderController.updateOrderStatus(req, res, next)
);
router.post("/orders/:orderId/verify-otp", (req, res, next) =>
  adminOrderController.verifyOtpAndCollect(req, res, next)
);
router.delete("/orders/:orderId", (req, res, next) =>
  adminOrderController.deleteOrder(req, res, next)
);

export default router;
