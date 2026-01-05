import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { adminMiddleware, authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

router.get(
    "/admin",
    authorizedMiddleware,
    adminMiddleware,
    (req, res) => {
      res.json({
        success: true,
        message: "Welcome Admin",
        data: req.user,
      });
    }
  );

export default router;