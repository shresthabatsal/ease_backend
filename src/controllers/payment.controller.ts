import { Request, Response, NextFunction } from "express";
import z from "zod";
import { PaymentService } from "../services/payment.service";
import { CreatePaymentDTO, UpdatePaymentStatusDTO } from "../dtos/payment.dto";

const paymentService = new PaymentService();

export class PaymentController {
  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreatePaymentDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const payment = await paymentService.createPayment(
        req.user!._id.toString(),
        parsedData.data
      );

      return res.status(201).json({
        success: true,
        message: "Payment initiated",
        data: payment,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getPaymentById(req.params.paymentId);

      return res.status(200).json({
        success: true,
        message: "Payment retrieved",
        data: payment,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getOrderPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getOrderPayment(req.params.orderId);

      return res.status(200).json({
        success: true,
        message: "Order payment retrieved",
        data: payment,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updatePaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = UpdatePaymentStatusDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const payment = await paymentService.updatePaymentStatus(
        req.params.paymentId,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "Payment status updated",
        data: payment,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getUserPayments(
        req.user!._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "User payments retrieved",
        data: payments,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
