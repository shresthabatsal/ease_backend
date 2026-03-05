import { Request, Response, NextFunction } from "express";
import { RatingService } from "../services/rating.service";
import { CreateRatingDTO, UpdateRatingDTO } from "../dtos/rating.dto";

const ratingService = new RatingService();

export class RatingController {
  async createRating(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateRatingDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const newRating = await ratingService.createRating(
        req.user!._id.toString(),
        parsedData.data
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
      const parsedData = UpdateRatingDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const updatedRating = await ratingService.updateRating(
        req.user!._id.toString(),
        req.params.ratingId,
        parsedData.data
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
      await ratingService.deleteRating(
        req.user!._id.toString(),
        req.params.ratingId
      );

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
