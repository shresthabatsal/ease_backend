import { Router } from "express";
import { StoreController } from "../controllers/admin/store.controller";

const router = Router();
const storeController = new StoreController();

// Get All Stores
router.get("/", (req, res, next) =>
  storeController.getAllStores(req, res, next)
);

// Get Store By ID
router.get("/:id", (req, res, next) =>
  storeController.getStoreById(req, res, next)
);

// Get Nearest Stores by user location
router.get("/nearest/by-location", (req, res, next) =>
  storeController.getNearestStores(req, res, next)
);

export default router;
