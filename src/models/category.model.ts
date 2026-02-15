import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  categoryImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    categoryImage: { type: String },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);
