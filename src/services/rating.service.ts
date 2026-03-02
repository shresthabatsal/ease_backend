import mongoose from "mongoose";
import { HttpError } from "../errors/http.error";
import { RatingRepository } from "../repositories/rating.repository";
import { ProductRepository } from "../repositories/product.repository";

const ratingRepository = new RatingRepository();
const productRepository = new ProductRepository();

export class RatingService {
  async createRating(
    userId: string,
    productId: string,
    rating: number,
    review: string
  ) {
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    const existingRating = await ratingRepository.getUserRatingForProduct(
      userId,
      productId
    );
    if (existingRating) {
      throw new HttpError(400, "You have already rated this product");
    }

    return await ratingRepository.createRating({
      productId: new mongoose.Types.ObjectId(productId),
      userId: new mongoose.Types.ObjectId(userId),
      rating,
      review,
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
    rating: number,
    review: string
  ) {
    const existingRating = await ratingRepository.getRatingById(ratingId);
    if (!existingRating) {
      throw new HttpError(404, "Rating not found");
    }

    if (existingRating.userId.toString() !== userId) {
      throw new HttpError(403, "Unauthorized to update this rating");
    }

    return await ratingRepository.updateRating(ratingId, { rating, review });
  }

  async deleteRating(userId: string, ratingId: string) {
    const existingRating = await ratingRepository.getRatingById(ratingId);
    if (!existingRating) {
      throw new HttpError(404, "Rating not found");
    }

    if (existingRating.userId.toString() !== userId) {
      throw new HttpError(403, "Unauthorized to delete this rating");
    }

    return await ratingRepository.deleteRating(ratingId);
  }
}
