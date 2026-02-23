import { Request, Response, NextFunction } from "express";
import z from "zod";
import { UpdateOrderStatusDTO, VerifyOtpDTO } from "../../dtos/order.dto";
import { OrderService } from "../../services/order.service";

const orderService = new OrderService();

export class AdminOrderController {
  async getStoreOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.adminGetStoreOrders(req.params.storeId);

      return res.status(200).json({
        success: true,
        message: "Store orders retrieved",
        data: orders,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = UpdateOrderStatusDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const order = await orderService.adminUpdateOrderStatus(
        req.params.orderId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verifyOtpAndCollect(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = VerifyOtpDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const order = await orderService.adminVerifyOtp(
        req.params.orderId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "OTP verified and order marked as collected",
        data: order,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      await orderService.adminDeleteOrder(req.params.orderId);

      return res.status(200).json({
        success: true,
        message: "Order deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrdersByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status query parameter is required",
        });
      }

      const orders = await orderService.getOrdersByStatus(
        status as string,
        req.params.storeId
      );

      return res.status(200).json({
        success: true,
        message: "Orders retrieved by status",
        data: orders,
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
      const { orderId } = req.params;
      const order = await orderService.getOrderById(orderId);

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
}
