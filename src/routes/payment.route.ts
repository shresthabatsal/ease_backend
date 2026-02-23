import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";
import { uploads } from "../middleware/upload.middleware";

const router = Router();
const paymentController = new PaymentController();

router.use(authorizedMiddleware);

router.post(
  "/submit-receipt",
  uploads.single("receiptImage"),
  (req, res, next) => paymentController.submitPaymentReceipt(req, res, next)
);

router.get("/:paymentId", (req, res, next) =>
  paymentController.getPayment(req, res, next)
);

router.get("/order/:orderId", (req, res, next) =>
  paymentController.getOrderPayment(req, res, next)
);
router.get("/order/:orderId/rejected", (req, res, next) =>
  paymentController.getRejectedPayments(req, res, next)
);

router.get("/", (req, res, next) =>
  paymentController.getUserPayments(req, res, next)
);

export default router;
