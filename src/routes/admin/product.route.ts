import { Router } from "express";
import { ProductController } from "../../controllers/admin/product.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middleware/auth.middleware";
import { uploads } from "../../middleware/upload.middleware";

const router = Router();
const productController = new ProductController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.post("/", uploads.single("productImage"), (req, res, next) =>
  productController.createProduct(req, res, next)
);

router.get("/", (req, res, next) =>
  productController.getAllProducts(req, res, next)
);

router.get("/:id", (req, res, next) =>
  productController.getProductById(req, res, next)
);

router.get("/store/:storeId", (req, res, next) =>
  productController.getProductsByStore(req, res, next)
);

router.put("/:id", uploads.single("productImage"), (req, res, next) =>
  productController.updateProduct(req, res, next)
);

router.delete("/:id", (req, res, next) =>
  productController.deleteProduct(req, res, next)
);

export default router;
