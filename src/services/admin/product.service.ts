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

  async getAllProducts(params: {
    page?: string;
    size?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const currentPage =
      params.page && parseInt(params.page) > 0 ? parseInt(params.page) : 1;
    const currentSize =
      params.size && parseInt(params.size) > 0 ? parseInt(params.size) : 10;
    const currentSearch = params.search?.trim() || "";

    const allowedSortFields = ["name", "price", "createdAt"];
    const currentSortBy = allowedSortFields.includes(params.sortBy || "")
      ? params.sortBy!
      : "createdAt";
    const currentSortOrder = params.sortOrder === "asc" ? "asc" : "desc";

    const { products, totalProducts } = await productRepository.getAllProducts({
      page: currentPage,
      size: currentSize,
      search: currentSearch,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
    });

    const pagination = {
      page: currentPage,
      size: currentSize,
      total: totalProducts,
      totalPages: Math.ceil(totalProducts / currentSize),
    };

    return { products, pagination };
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
