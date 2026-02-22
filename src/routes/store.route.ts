import { Router } from "express";
import { StoreController } from "../controllers/admin/store.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const storeController = new StoreController();

router.use(authorizedMiddleware);

router.get("/", (req, res, next) =>
  storeController.getAllStores(req, res, next)
);
router.get("/:id", (req, res, next) =>
  storeController.getStoreById(req, res, next)
);

export default router;
