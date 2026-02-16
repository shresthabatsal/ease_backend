import mongoose, { Document, Schema } from "mongoose";

export interface ISubcategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  categoryId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema: Schema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

SubcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const SubcategoryModel = mongoose.model<ISubcategory>(
  "Subcategory",
  SubcategorySchema
);
