import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const cartController = new CartController();

router.use(authorizedMiddleware);

router.post("/", (req, res, next) => cartController.addToCart(req, res, next));

router.get("/", (req, res, next) => cartController.getCart(req, res, next));

router.put("/:cartItemId", (req, res, next) =>
  cartController.updateCartItem(req, res, next)
);

router.delete("/:cartItemId", (req, res, next) =>
  cartController.removeFromCart(req, res, next)
);

router.delete("/", (req, res, next) =>
  cartController.clearCart(req, res, next)
);

export default router;
