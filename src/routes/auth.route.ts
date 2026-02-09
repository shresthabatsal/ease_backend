import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../middleware/auth.middleware";
import { uploads } from "../middleware/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));

router.get("/admin", authorizedMiddleware, adminMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin",
    data: req.user,
  });
});

router.get("/profile", authorizedMiddleware, authController.getProfile);
router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.single("profilePicture"),
  authController.updateProfile
);
router.post(
  "/upload-profile-picture",
  authorizedMiddleware,
  uploads.single("profilePicture"),
  authController.uploadProfilePicture
);
router.delete(
  "/delete-account",
  authorizedMiddleware,
  authController.deleteAccount
);
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password", authController.resetPassword);

export default router;
