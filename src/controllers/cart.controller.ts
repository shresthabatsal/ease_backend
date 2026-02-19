import { Request, Response, NextFunction } from "express";
import z from "zod";
import { CartService } from "../services/cart.service";
import { AddToCartDTO, UpdateCartDTO } from "../dtos/cart.dto";

const cartService = new CartService();

export class CartController {
  async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = AddToCartDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const cartItem = await cartService.addToCart(
        req.user!._id.toString(),
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Item added to cart",
        data: cartItem,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await cartService.getUserCart(req.user!._id.toString());

      return res.status(200).json({
        success: true,
        message: "Cart retrieved",
        data: cart,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateCartItem(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = UpdateCartDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const updatedItem = await cartService.updateCartItem(
        req.user!._id.toString(),
        req.params.cartItemId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Cart item updated",
        data: updatedItem,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async removeFromCart(req: Request, res: Response, next: NextFunction) {
    try {
      await cartService.removeFromCart(
        req.user!._id.toString(),
        req.params.cartItemId
      );

      return res.status(200).json({
        success: true,
        message: "Item removed from cart",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      await cartService.clearCart(req.user!._id.toString());

      return res.status(200).json({
        success: true,
        message: "Cart cleared",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
