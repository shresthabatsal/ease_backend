import { HttpError } from "../errors/http.error";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { StoreRepository } from "../repositories/store.repository";
import { SubcategoryRepository } from "../repositories/subcategory.repository";

const productRepository = new ProductRepository();
const storeRepository = new StoreRepository();
const categoryRepository = new CategoryRepository();
const subcategoryRepository = new SubcategoryRepository();

export class ProductService {
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

  async getProductsByStoreAndCategory(storeId: string, categoryId: string) {
    const store = await storeRepository.getStoreById(storeId);
    if (!store) throw new HttpError(404, "Store not found");

    const category = await categoryRepository.getCategoryById(categoryId);
    if (!category) throw new HttpError(404, "Category not found");

    return await productRepository.getProductsByStoreAndCategory(
      storeId,
      categoryId
    );
  }

  async getProductsByStoreAndSubcategory(
    storeId: string,
    subcategoryId: string
  ) {
    const store = await storeRepository.getStoreById(storeId);
    if (!store) throw new HttpError(404, "Store not found");

    const subcategory = await subcategoryRepository.getSubcategoryById(
      subcategoryId
    );
    if (!subcategory) throw new HttpError(404, "Subcategory not found");

    return await productRepository.getProductsByStoreAndSubcategory(
      storeId,
      subcategoryId
    );
  }
}
