import mongoose, { Document, Schema } from "mongoose";

export interface IStore extends Document {
  _id: mongoose.Types.ObjectId;
  storeName: string;
  location: string;
  pickupInstructions: string;
  storeImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema<IStore>(
  {
    storeName: { type: String, required: true },
    location: { type: String, required: true },
    pickupInstructions: { type: String, required: true },
    storeImage: { type: String },
  },
  { timestamps: true }
);

export const StoreModel = mongoose.model<IStore>("Store", StoreSchema);
