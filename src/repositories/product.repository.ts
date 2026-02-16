import { ProductModel, IProduct } from "../models/product.model";

export interface IProductRepository {
  createProduct(data: Partial<IProduct>): Promise<IProduct>;
  getAllProducts(): Promise<IProduct[]>;
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

  async getAllProducts(): Promise<IProduct[]> {
    return await ProductModel.find()
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("storeId");
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
