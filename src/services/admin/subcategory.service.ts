import { SubcategoryRepository } from "../../repositories/subcategory.repository";
import { CategoryRepository } from "../../repositories/category.repository";
import { HttpError } from "../../errors/http.error";
import {
  CreateSubcategoryDTOType,
  UpdateSubcategoryDTOType,
} from "../../dtos/subcategory.dto";

const subcategoryRepository = new SubcategoryRepository();
const categoryRepository = new CategoryRepository();

export class SubcategoryService {
  async createSubcategory(data: CreateSubcategoryDTOType) {
    const category = await categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    return await subcategoryRepository.createSubcategory(data);
  }

  async getAllSubcategories() {
    return await subcategoryRepository.getAllSubcategories();
  }

  async getSubcategoryById(id: string) {
    const subcategory = await subcategoryRepository.getSubcategoryById(id);
    if (!subcategory) {
      throw new HttpError(404, "Subcategory not found");
    }
    return subcategory;
  }

  async getSubcategoriesByCategory(categoryId: string) {
    const category = await categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }
    return await subcategoryRepository.getSubcategoriesByCategory(categoryId);
  }

  async updateSubcategory(id: string, data: UpdateSubcategoryDTOType) {
    const subcategory = await subcategoryRepository.getSubcategoryById(id);
    if (!subcategory) {
      throw new HttpError(404, "Subcategory not found");
    }

    if (data.categoryId) {
      const category = await categoryRepository.getCategoryById(
        data.categoryId
      );
      if (!category) {
        throw new HttpError(404, "Category not found");
      }
    }

    return await subcategoryRepository.updateSubcategory(id, data);
  }

  async deleteSubcategory(id: string) {
    const subcategory = await subcategoryRepository.getSubcategoryById(id);
    if (!subcategory) {
      throw new HttpError(404, "Subcategory not found");
    }
    return await subcategoryRepository.deleteSubcategory(id);
  }
}
