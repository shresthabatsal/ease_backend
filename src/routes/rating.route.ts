import { Router } from "express";
import { RatingController } from "../controllers/rating.controller";
import { authorizedMiddleware } from "../middleware/auth.middleware";

const router = Router();
const ratingController = new RatingController();

router.post("/", authorizedMiddleware, (req, res, next) =>
  ratingController.createRating(req, res, next)
);
router.get("/product/:productId", (req, res, next) =>
  ratingController.getRatingsByProduct(req, res, next)
);
router.put("/:ratingId", authorizedMiddleware, (req, res, next) =>
  ratingController.updateRating(req, res, next)
);
router.delete("/:ratingId", authorizedMiddleware, (req, res, next) =>
  ratingController.deleteRating(req, res, next)
);

export default router;
