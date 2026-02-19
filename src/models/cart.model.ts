import mongoose, { Document, Schema } from "mongoose";

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema: Schema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const CartModel = mongoose.model<ICart>("Cart", CartSchema);
