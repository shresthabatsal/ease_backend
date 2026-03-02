import mongoose from "mongoose";
import { RatingModel, IRating } from "../models/rating.model";

export interface IRatingRepository {
  createRating(data: Partial<IRating>): Promise<IRating>;
  getRatingById(id: string): Promise<IRating | null>;
  getRatingsByProduct(productId: string): Promise<IRating[]>;
  getUserRatingForProduct(
    userId: string,
    productId: string
  ): Promise<IRating | null>;
  updateRating(id: string, data: Partial<IRating>): Promise<IRating | null>;
  deleteRating(id: string): Promise<boolean>;
  getProductAverageRating(productId: string): Promise<number>;
}

export class RatingRepository implements IRatingRepository {
  async createRating(data: Partial<IRating>): Promise<IRating> {
    const rating = new RatingModel(data);
    return await rating.save();
  }

  async getRatingById(id: string): Promise<IRating | null> {
    return await RatingModel.findById(id).populate("userId", "name email");
  }

  async getRatingsByProduct(productId: string): Promise<IRating[]> {
    return await RatingModel.find({ productId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  }

  async getUserRatingForProduct(
    userId: string,
    productId: string
  ): Promise<IRating | null> {
    return await RatingModel.findOne({ userId, productId });
  }

  async updateRating(
    id: string,
    data: Partial<IRating>
  ): Promise<IRating | null> {
    return await RatingModel.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("userId", "name email");
  }

  async deleteRating(id: string): Promise<boolean> {
    const result = await RatingModel.findByIdAndDelete(id);
    return !!result;
  }

  async getProductAverageRating(productId: string): Promise<number> {
    const result = await RatingModel.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    return result.length > 0 ? result[0].avgRating : 0;
  }
}
