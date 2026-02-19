import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const paymentController = new PaymentController();

router.use(authorizedMiddleware);

router.post("/", (req, res, next) =>
  paymentController.createPayment(req, res, next)
);

router.get("/:paymentId", (req, res, next) =>
  paymentController.getPayment(req, res, next)
);

router.get("/order/:orderId", (req, res, next) =>
  paymentController.getOrderPayment(req, res, next)
);

router.put("/:paymentId", (req, res, next) =>
  paymentController.updatePaymentStatus(req, res, next)
);

router.get("/", (req, res, next) =>
  paymentController.getUserPayments(req, res, next)
);

export default router;
