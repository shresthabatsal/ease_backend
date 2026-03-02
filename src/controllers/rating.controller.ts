import { Request, Response, NextFunction } from "express";
import { RatingService } from "../services/rating.service";

const ratingService = new RatingService();

export class RatingController {
  async createRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, rating, review } = req.body;
      const userId = (req as any).user.id;

      const newRating = await ratingService.createRating(
        userId,
        productId,
        rating,
        review
      );

      return res.status(201).json({
        success: true,
        message: "Rating created successfully",
        data: newRating,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getRatingsByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const data = await ratingService.getRatingsByProduct(productId);

      return res.status(200).json({
        success: true,
        message: "Ratings retrieved successfully",
        data,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { ratingId } = req.params;
      const { rating, review } = req.body;
      const userId = (req as any).user.id;

      const updatedRating = await ratingService.updateRating(
        userId,
        ratingId,
        rating,
        review
      );

      return res.status(200).json({
        success: true,
        message: "Rating updated successfully",
        data: updatedRating,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteRating(req: Request, res: Response, next: NextFunction) {
    try {
      const { ratingId } = req.params;
      const userId = (req as any).user.id;

      await ratingService.deleteRating(userId, ratingId);

      return res.status(200).json({
        success: true,
        message: "Rating deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
