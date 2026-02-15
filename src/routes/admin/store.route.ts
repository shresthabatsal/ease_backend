import { Router } from "express";
import { StoreController } from "../../controllers/admin/store.controller";
import {
  adminMiddleware,
  authorizedMiddleware,
} from "../../middleware/auth.middleware";
import { uploads } from "../../middleware/upload.middleware";

const router = Router();
const storeController = new StoreController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

// Create Store
router.post("/", uploads.single("storeImage"), (req, res, next) =>
  storeController.createStore(req, res, next)
);

// Get All Stores
router.get("/", (req, res, next) =>
  storeController.getAllStores(req, res, next)
);

// Get Store By ID
router.get("/:id", (req, res, next) =>
  storeController.getStoreById(req, res, next)
);

// Update Store
router.put("/:id", uploads.single("storeImage"), (req, res, next) =>
  storeController.updateStore(req, res, next)
);

// Delete Store
router.delete("/:id", (req, res, next) =>
  storeController.deleteStore(req, res, next)
);

export default router;
