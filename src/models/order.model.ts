import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  pickupCode: string;
  otp: string;
  paymentMethod: "CASH_ON_PICKUP" | "ESEWA" | "KHALTI";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "READY_FOR_COLLECTION"
    | "COLLECTED"
    | "CANCELLED";
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    pickupCode: { type: String, unique: true, required: true },
    otp: { type: String },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_PICKUP", "ESEWA", "KHALTI"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "READY_FOR_COLLECTION",
        "COLLECTED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    orderDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
