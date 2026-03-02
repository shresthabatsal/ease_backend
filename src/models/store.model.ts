import mongoose, { Document, Schema } from "mongoose";

export interface IStore extends Document {
  _id: mongoose.Types.ObjectId;
  storeName: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  pickupInstructions: string;
  storeImage?: string;
  paymentQRCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema: Schema = new Schema<IStore>(
  {
    storeName: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    pickupInstructions: { type: String, required: true },
    storeImage: { type: String },
    paymentQRCode: { type: String },
  },
  { timestamps: true }
);

// Index for geospatial queries
StoreSchema.index({ "coordinates.latitude": 1, "coordinates.longitude": 1 });

export const StoreModel = mongoose.model<IStore>("Store", StoreSchema);
