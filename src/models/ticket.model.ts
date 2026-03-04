import mongoose, { Document, Schema } from "mongoose";

export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: "BUG" | "COMPLAINT" | "REFUND" | "DELIVERY" | "OTHER";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema<ITicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["BUG", "COMPLAINT", "REFUND", "DELIVERY", "OTHER"],
      default: "OTHER",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

TicketSchema.index({ userId: 1, status: 1 });
TicketSchema.index({ adminId: 1, status: 1 });

export const TicketModel = mongoose.model<ITicket>("Ticket", TicketSchema);
