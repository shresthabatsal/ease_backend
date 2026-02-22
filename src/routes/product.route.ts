import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const productController = new ProductController();

router.use(authorizedMiddleware);

router.get("/", (req, res, next) =>
  productController.getAllProducts(req, res, next)
);
router.get("/store/:storeId", (req, res, next) =>
  productController.getProductsByStore(req, res, next)
);
router.get("/:id", (req, res, next) =>
  productController.getProductById(req, res, next)
);
router.get("/store/:storeId/category/:categoryId", (req, res, next) =>
  productController.getProductsByStoreAndCategory(req, res, next)
);
router.get("/store/:storeId/subcategory/:subcategoryId", (req, res, next) =>
  productController.getProductsByStoreAndSubcategory(req, res, next)
);

export default router;
