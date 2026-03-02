import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  type:
    | "ORDER_CREATED"
    | "PAYMENT_VERIFIED"
    | "ORDER_CONFIRMED"
    | "READY_FOR_COLLECTION"
    | "COLLECTION_REMINDER"
    | "ORDER_COLLECTED"
    | "ORDER_CANCELLED"
    | "PAYMENT_REJECTED";
  title: string;
  message: string;
  data?: {
    pickupCode?: string;
    otp?: string;
    pickupTime?: string;
    pickupDate?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "ORDER_CREATED",
        "PAYMENT_VERIFIED",
        "ORDER_CONFIRMED",
        "READY_FOR_COLLECTION",
        "COLLECTION_REMINDER",
        "ORDER_COLLECTED",
        "ORDER_CANCELLED",
        "PAYMENT_REJECTED",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      pickupCode: String,
      otp: String,
      pickupTime: String,
      pickupDate: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ isRead: 1, userId: 1 });

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
