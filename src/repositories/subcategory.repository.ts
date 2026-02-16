import mongoose from "mongoose";
import { SubcategoryModel, ISubcategory } from "../models/subcategory.model";

export interface ISubcategoryRepository {
  createSubcategory(data: CreateSubcategoryInput): Promise<ISubcategory>;
  getAllSubcategories(): Promise<ISubcategory[]>;
  getSubcategoryById(id: string): Promise<ISubcategory | null>;
  getSubcategoriesByCategory(categoryId: string): Promise<ISubcategory[]>;
  updateSubcategory(
    id: string,
    data: UpdateSubcategoryInput
  ): Promise<ISubcategory | null>;

  deleteSubcategory(id: string): Promise<boolean>;
}

export class SubcategoryRepository implements ISubcategoryRepository {
  async createSubcategory(data: CreateSubcategoryInput): Promise<ISubcategory> {
    const subcategory = new SubcategoryModel({
      name: data.name,
      categoryId: new mongoose.Types.ObjectId(data.categoryId),
    });

    return await subcategory.save();
  }

  async getAllSubcategories(): Promise<ISubcategory[]> {
    return await SubcategoryModel.find().populate("categoryId");
  }

  async getSubcategoryById(id: string): Promise<ISubcategory | null> {
    return await SubcategoryModel.findById(id).populate("categoryId");
  }

  async getSubcategoriesByCategory(
    categoryId: string
  ): Promise<ISubcategory[]> {
    return await SubcategoryModel.find({ categoryId }).populate("categoryId");
  }

  async updateSubcategory(
    id: string,
    data: UpdateSubcategoryInput
  ): Promise<ISubcategory | null> {
    const updateData: any = { ...data };

    if (data.categoryId) {
      updateData.categoryId = new mongoose.Types.ObjectId(data.categoryId);
    }

    return await SubcategoryModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("categoryId");
  }

  async deleteSubcategory(id: string): Promise<boolean> {
    const result = await SubcategoryModel.findByIdAndDelete(id);
    return !!result;
  }
}

type CreateSubcategoryInput = {
  name: string;
  categoryId: string;
};

type UpdateSubcategoryInput = {
  name?: string;
  categoryId?: string;
};
