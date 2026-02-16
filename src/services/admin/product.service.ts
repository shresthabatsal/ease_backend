import { ProductRepository } from "../../repositories/product.repository";
import { StoreRepository } from "../../repositories/store.repository";
import { CategoryRepository } from "../../repositories/category.repository";
import { SubcategoryRepository } from "../../repositories/subcategory.repository";
import { HttpError } from "../../errors/http.error";
import {
  CreateProductDTOType,
  UpdateProductDTOType,
} from "../../dtos/product.dto";

const productRepository = new ProductRepository();
const storeRepository = new StoreRepository();
const categoryRepository = new CategoryRepository();
const subcategoryRepository = new SubcategoryRepository();

export class ProductService {
  async createProduct(data: CreateProductDTOType, file?: Express.Multer.File) {
    const store = await storeRepository.getStoreById(data.storeId);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }

    const category = await categoryRepository.getCategoryById(data.categoryId);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }

    const subcategory = await subcategoryRepository.getSubcategoryById(
      data.subcategoryId
    );
    if (!subcategory) {
      throw new HttpError(404, "Subcategory not found");
    }

    if (!file) {
      throw new HttpError(400, "Product image is required");
    }

    const productData: any = {
      ...data,
      productImage: `/uploads/products/${file.filename}`,
    };

    return await productRepository.createProduct(productData);
  }

  async getAllProducts() {
    return await productRepository.getAllProducts();
  }

  async getProductById(id: string) {
    const product = await productRepository.getProductById(id);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    return product;
  }

  async getProductsByStore(storeId: string) {
    const store = await storeRepository.getStoreById(storeId);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }
    return await productRepository.getProductsByStore(storeId);
  }

  async updateProduct(
    id: string,
    data: UpdateProductDTOType,
    file?: Express.Multer.File
  ) {
    const product = await productRepository.getProductById(id);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (data.storeId) {
      const store = await storeRepository.getStoreById(data.storeId);
      if (!store) {
        throw new HttpError(404, "Store not found");
      }
    }

    if (data.categoryId) {
      const category = await categoryRepository.getCategoryById(
        data.categoryId
      );
      if (!category) {
        throw new HttpError(404, "Category not found");
      }
    }

    if (data.subcategoryId) {
      const subcategory = await subcategoryRepository.getSubcategoryById(
        data.subcategoryId
      );
      if (!subcategory) {
        throw new HttpError(404, "Subcategory not found");
      }
    }

    const updateData: any = { ...data };
    if (file) {
      updateData.productImage = `/uploads/products/${file.filename}`;
    }

    return await productRepository.updateProduct(id, updateData);
  }

  async deleteProduct(id: string) {
    const product = await productRepository.getProductById(id);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }
    return await productRepository.deleteProduct(id);
  }
}
