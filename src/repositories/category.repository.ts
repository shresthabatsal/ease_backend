import { CategoryModel, ICategory } from "../models/category.model";

export interface ICategoryRepository {
  createCategory(data: Partial<ICategory>): Promise<ICategory>;
  getAllCategories(): Promise<ICategory[]>;
  getCategoryById(id: string): Promise<ICategory | null>;
  updateCategory(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null>;
  deleteCategory(id: string): Promise<boolean>;
}

export class CategoryRepository implements ICategoryRepository {
  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    const category = new CategoryModel(data);
    return await category.save();
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await CategoryModel.find();
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return await CategoryModel.findById(id);
  }

  async updateCategory(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    return await CategoryModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  }
}
