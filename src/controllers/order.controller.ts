import { Request, Response, NextFunction } from "express";
import z from "zod";
import { OrderService } from "../services/order.service";
import { BuyNowDTO, CancelOrderDTO, CreateOrderDTO } from "../dtos/order.dto";

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateOrderDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const order = await orderService.createOrderFromCart(
        req.user!._id.toString(),
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Order created successfully. Please proceed with payment.",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async buyNow(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = BuyNowDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const order = await orderService.buyNow(
        req.user!._id.toString(),
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message:
          "Order created successfully via Buy Now. Please proceed with payment.",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(req.params.orderId);

      return res.status(200).json({
        success: true,
        message: "Order retrieved",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.getUserOrders(req.user!._id.toString());

      return res.status(200).json({
        success: true,
        message: "User orders retrieved",
        data: orders,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CancelOrderDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const order = await orderService.cancelOrder(
        req.params.orderId,
        req.user!._id.toString(),
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
