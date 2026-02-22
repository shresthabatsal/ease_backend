import { Router } from "express";
import { CategoryController } from "../controllers/admin/category.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";
const router = Router();
const categoryController = new CategoryController();

router.use(authorizedMiddleware);

router.get("/", (req, res, next) =>
  categoryController.getAllCategories(req, res, next)
);
router.get("/:id", (req, res, next) =>
  categoryController.getCategoryById(req, res, next)
);

export default router;
