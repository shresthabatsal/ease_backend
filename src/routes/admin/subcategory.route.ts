import { Router } from "express";
import { SubcategoryController } from "../../controllers/admin/subcategory.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middleware/auth.middleware";

const router = Router();
const subcategoryController = new SubcategoryController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.post("/", (req, res, next) =>
  subcategoryController.createSubcategory(req, res, next)
);

router.get("/", (req, res, next) =>
  subcategoryController.getAllSubcategories(req, res, next)
);

router.get("/:id", (req, res, next) =>
  subcategoryController.getSubcategoryById(req, res, next)
);

router.get("/category/:categoryId", (req, res, next) =>
  subcategoryController.getSubcategoriesByCategory(req, res, next)
);

router.put("/:id", (req, res, next) =>
  subcategoryController.updateSubcategory(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  subcategoryController.deleteSubcategory(req, res, next)
);

export default router;
