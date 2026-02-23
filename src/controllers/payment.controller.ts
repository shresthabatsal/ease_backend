import { Request, Response, NextFunction } from "express";
import z from "zod";
import { PaymentService } from "../services/payment.service";
import { GetPaymentsFilterDTO, SubmitPaymentReceiptDTO, VerifyPaymentDTO } from "../dtos/payment.dto";

const paymentService = new PaymentService();

export class PaymentController {
  async submitPaymentReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = SubmitPaymentReceiptDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Receipt image is required",
        });
      }

      const payment = await paymentService.submitPaymentReceipt(
        req.user!._id.toString(),
        parsedData.data,
        req.file
      );

      return res.status(201).json({
        success: true,
        message:
          "Payment receipt submitted successfully. Awaiting admin verification.",
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

  async getRejectedPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getRejectedPayments(
        req.params.orderId
      );

      return res.status(200).json({
        success: true,
        message: "Rejected payments retrieved",
        data: payments,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getPendingPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getPendingPayments();

      return res.status(200).json({
        success: true,
        message: "Pending payments retrieved",
        data: payments,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedFilters = GetPaymentsFilterDTO.safeParse(req.query);

      if (!parsedFilters.success) {
        return res.status(400).json({
          success: false,
          message: parsedFilters.error.flatten().fieldErrors,
        });
      }

      const result = await paymentService.getAllPayments(parsedFilters.data);

      return res.status(200).json({
        success: true,
        message: "All payments retrieved",
        data: result.payments,
        pagination: {
          total: result.total,
          pages: result.pages,
          page: parseInt(parsedFilters.data.page || "1"),
          limit: parseInt(parsedFilters.data.limit || "10"),
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = VerifyPaymentDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: parsedData.error.flatten().fieldErrors,
        });
      }

      const result = await paymentService.verifyPayment(
        req.params.paymentId,
        req.user!._id.toString(),
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          payment: result.payment,
          order: result.order,
        },
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
