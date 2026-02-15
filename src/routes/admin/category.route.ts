import { Router } from "express";
import { CategoryController } from "../../controllers/admin/category.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middleware/auth.middleware";
import { uploads } from "../../middleware/upload.middleware";

const router = Router();
const categoryController = new CategoryController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.post("/", uploads.single("categoryImage"), (req, res, next) =>
  categoryController.createCategory(req, res, next)
);

router.get("/", (req, res, next) =>
  categoryController.getAllCategories(req, res, next)
);

router.get("/:id", (req, res, next) =>
  categoryController.getCategoryById(req, res, next)
);

router.put("/:id", uploads.single("categoryImage"), (req, res, next) =>
  categoryController.updateCategory(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  categoryController.deleteCategory(req, res, next)
);

export default router;
