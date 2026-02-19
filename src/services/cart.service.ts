import mongoose from "mongoose";
import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { HttpError } from "../errors/http.error";
import { AddToCartDTOType, UpdateCartDTOType } from "../dtos/cart.dto";
import { CartModel } from "../models/cart.model";

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

export class CartService {
  async addToCart(userId: string, data: AddToCartDTOType) {
    if (!data.productId || data.productId.trim() === "") {
      throw new HttpError(400, "Product ID is required");
    }

    const product = await productRepository.getProductById(data.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.quantity < data.quantity) {
      throw new HttpError(400, "Insufficient stock available");
    }

    const existingCartItem = await cartRepository.getCartItem(
      userId,
      data.productId
    );

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + data.quantity;
      if (product.quantity < newQuantity) {
        throw new HttpError(400, "Insufficient stock for requested quantity");
      }
      return await cartRepository.updateCartItem(
        existingCartItem._id.toString(),
        newQuantity
      );
    }

    return await cartRepository.addToCart({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(data.productId),
      quantity: data.quantity,
    });
  }

  async getUserCart(userId: string) {
    const cartItems = await cartRepository.getUserCart(userId);

    const enrichedCart = cartItems.map((item: any) => ({
      ...item.toObject(),
      subtotal: item.productId.price * item.quantity,
    }));

    const totalPrice = enrichedCart.reduce(
      (sum: number, item: any) => sum + item.subtotal,
      0
    );

    return {
      items: enrichedCart,
      totalPrice,
      itemCount: cartItems.length,
    };
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    data: UpdateCartDTOType
  ) {
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      throw new HttpError(400, "Invalid cart item ID");
    }

    const cart = await CartModel.findById(cartItemId).populate("productId");
    if (!cart || cart.userId.toString() !== userId) {
      throw new HttpError(403, "Unauthorized access to cart item");
    }

    const product = await productRepository.getProductById(
      cart.productId._id.toString()
    );
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.quantity < data.quantity) {
      throw new HttpError(400, "Insufficient stock available");
    }

    cart.quantity = data.quantity;
    await cart.save();
    return cart;
  }

  async removeFromCart(userId: string, cartItemId: string) {
    if (!mongoose.Types.ObjectId.isValid(cartItemId)) {
      throw new HttpError(400, "Invalid cart item ID");
    }

    const cart = await CartModel.findById(cartItemId);
    if (!cart || cart.userId.toString() !== userId) {
      throw new HttpError(403, "Unauthorized access to cart item");
    }

    return await cartRepository.removeFromCart(cartItemId);
  }

  async clearCart(userId: string) {
    return await cartRepository.clearUserCart(userId);
  }
}
