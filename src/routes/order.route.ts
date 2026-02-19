import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const orderController = new OrderController();

router.use(authorizedMiddleware);

router.post("/", (req, res, next) =>
  orderController.createOrder(req, res, next)
);

router.post("/buy-now", (req, res, next) =>
  orderController.buyNow(req, res, next)
);

router.get("/", (req, res, next) =>
  orderController.getUserOrders(req, res, next)
);

router.get("/:orderId", (req, res, next) =>
  orderController.getOrder(req, res, next)
);

router.post("/:orderId/cancel", (req, res, next) =>
  orderController.cancelOrder(req, res, next)
);

export default router;
