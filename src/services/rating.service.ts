import mongoose from "mongoose";
import { HttpError } from "../errors/http.error";
import { RatingRepository } from "../repositories/rating.repository";
import { ProductRepository } from "../repositories/product.repository";
import { CreateRatingDTOType, UpdateRatingDTOType } from "../dtos/rating.dto";

const ratingRepository = new RatingRepository();
const productRepository = new ProductRepository();

export class RatingService {
  async createRating(userId: string, data: CreateRatingDTOType) {
    const product = await productRepository.getProductById(data.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    const existingRating = await ratingRepository.getUserRatingForProduct(
      userId,
      data.productId
    );
    if (existingRating) {
      throw new HttpError(400, "You have already rated this product");
    }

    return await ratingRepository.createRating({
      productId: new mongoose.Types.ObjectId(data.productId),
      userId: new mongoose.Types.ObjectId(userId),
      rating: data.rating,
      review: data.review,
    });
  }

  async getRatingsByProduct(productId: string) {
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    const ratings = await ratingRepository.getRatingsByProduct(productId);
    const averageRating = await ratingRepository.getProductAverageRating(
      productId
    );

    return {
      ratings,
      averageRating,
      totalRatings: ratings.length,
    };
  }

  async updateRating(
    userId: string,
    ratingId: string,
    data: UpdateRatingDTOType
  ) {
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      throw new HttpError(400, "Invalid rating ID");
    }

    const existingRating = await ratingRepository.getRatingByIdRaw(ratingId);
    if (!existingRating) {
      throw new HttpError(404, "Rating not found");
    }

    if (existingRating.userId.toString() !== userId) {
      throw new HttpError(403, "Unauthorized to update this rating");
    }

    return await ratingRepository.updateRating(ratingId, {
      rating: data.rating,
      review: data.review,
    });
  }

  async deleteRating(userId: string, ratingId: string) {
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
      throw new HttpError(400, "Invalid rating ID");
    }

    const existingRating = await ratingRepository.getRatingByIdRaw(ratingId);
    if (!existingRating) {
      throw new HttpError(404, "Rating not found");
    }

    if (existingRating.userId.toString() !== userId) {
      throw new HttpError(403, "Unauthorized to delete this rating");
    }

    return await ratingRepository.deleteRating(ratingId);
  }
}
