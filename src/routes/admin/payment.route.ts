import { Router } from "express";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../../middleware/auth.middleware";
import { PaymentController } from "../../controllers/payment.controller";

const router = Router();
const paymentController = new PaymentController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", (req, res, next) =>
  paymentController.getAllPayments(req, res, next)
);
router.get("/pending", (req, res, next) =>
  paymentController.getPendingPayments(req, res, next)
);
router.get("/:paymentId", (req, res, next) =>
  paymentController.getPayment(req, res, next)
);
router.put("/:paymentId/verify", (req, res, next) =>
  paymentController.verifyPayment(req, res, next)
);

export default router;
