import { CategoryRepository } from "../../repositories/category.repository";
import { HttpError } from "../../errors/http.error";
import {
  CreateCategoryDTOType,
  UpdateCategoryDTOType,
} from "../../dtos/category.dto";

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async createCategory(
    data: CreateCategoryDTOType,
    file?: Express.Multer.File
  ) {
    const categoryData: any = { ...data };
    if (file) {
      categoryData.categoryImage = `/uploads/categories/${file.filename}`;
    }
    return await categoryRepository.createCategory(categoryData);
  }

  async getAllCategories() {
    return await categoryRepository.getAllCategories();
  }

  async getCategoryById(id: string) {
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    return category;
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDTOType,
    file?: Express.Multer.File
  ) {
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    const updateData: any = { ...data };
    if (file) {
      updateData.categoryImage = `/uploads/categories/${file.filename}`;
    }
    return await categoryRepository.updateCategory(id, updateData);
  }

  async deleteCategory(id: string) {
    const category = await categoryRepository.getCategoryById(id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    return await categoryRepository.deleteCategory(id);
  }
}
