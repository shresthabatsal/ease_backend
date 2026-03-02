import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema<IRating>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

RatingSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const RatingModel = mongoose.model<IRating>("Rating", RatingSchema);
