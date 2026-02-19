import { CartModel, ICart } from "../models/cart.model";

export interface ICartRepository {
  addToCart(data: Partial<ICart>): Promise<ICart>;
  getUserCart(userId: string): Promise<ICart[]>;
  getCartItem(userId: string, productId: string): Promise<ICart | null>;
  updateCartItem(id: string, quantity: number): Promise<ICart | null>;
  removeFromCart(id: string): Promise<boolean>;
  clearUserCart(userId: string): Promise<boolean>;
}

export class CartRepository implements ICartRepository {
  async addToCart(data: Partial<ICart>): Promise<ICart> {
    const cartItem = new CartModel(data);
    return await cartItem.save();
  }

  async getUserCart(userId: string): Promise<ICart[]> {
    return await CartModel.find({ userId })
      .populate("productId")
      .populate("userId");
  }

  async getCartItem(userId: string, productId: string): Promise<ICart | null> {
    return await CartModel.findOne({ userId, productId })
      .populate("productId")
      .populate("userId");
  }

  async updateCartItem(id: string, quantity: number): Promise<ICart | null> {
    return await CartModel.findByIdAndUpdate(id, { quantity }, { new: true })
      .populate("productId")
      .populate("userId");
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await CartModel.findByIdAndDelete(id);
    return !!result;
  }

  async clearUserCart(userId: string): Promise<boolean> {
    const result = await CartModel.deleteMany({ userId });
    return result.deletedCount > 0;
  }
}
