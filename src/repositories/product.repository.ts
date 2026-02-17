import { ProductModel, IProduct } from "../models/product.model";

export interface IProductRepository {
  createProduct(data: Partial<IProduct>): Promise<IProduct>;
  getAllProducts(params: {
    page: number;
    size: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ products: IProduct[]; totalProducts: number }>;
  getProductById(id: string): Promise<IProduct | null>;
  getProductsByStore(storeId: string): Promise<IProduct[]>;
  updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
  deleteProduct(id: string): Promise<boolean>;
}

export class ProductRepository implements IProductRepository {
  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    const product = new ProductModel(data);
    return await product.save();
  }

  async getAllProducts(params: {
    page: number;
    size: number;
    search?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ products: IProduct[]; totalProducts: number }> {
    let filter: any = {};

    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: "i" } },
        { description: { $regex: params.search, $options: "i" } },
      ];
    }

    const sortDirection = params.sortOrder === "asc" ? 1 : -1;

    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter)
        .populate("categoryId")
        .populate("subcategoryId")
        .populate("storeId")
        .sort({ [params.sortBy]: sortDirection })
        .skip((params.page - 1) * params.size)
        .limit(params.size),
      ProductModel.countDocuments(filter),
    ]);

    return { products, totalProducts };
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return await ProductModel.findById(id)
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("storeId");
  }

  async getProductsByStore(storeId: string): Promise<IProduct[]> {
    return await ProductModel.find({ storeId })
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("storeId");
  }

  async updateProduct(
    id: string,
    data: Partial<IProduct>
  ): Promise<IProduct | null> {
    return await ProductModel.findByIdAndUpdate(id, data, { new: true })
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("storeId");
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }
}
