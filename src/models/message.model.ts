import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderRole: "USER" | "ADMIN";
  message: string;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["USER", "ADMIN"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachmentUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ ticketId: 1, createdAt: 1 });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
