import { PaymentRepository } from "../repositories/payment.repository";
import { OrderRepository } from "../repositories/order.repository";
import { HttpError } from "../errors/http.error";
import {
  SubmitPaymentReceiptDTOType,
  VerifyPaymentDTOType,
  GetPaymentsFilterDTOType,
} from "../dtos/payment.dto";
import mongoose from "mongoose";
import { ProductModel } from "../models/product.model";

const paymentRepository = new PaymentRepository();
const orderRepository = new OrderRepository();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class PaymentService {
  async submitPaymentReceipt(
    userId: string,
    data: SubmitPaymentReceiptDTOType,
    file?: Express.Multer.File
  ) {
    const order = await orderRepository.getOrderById(data.orderId);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    const orderUserId = (order.userId as any)._id
      ? (order.userId as any)._id.toString()
      : order.userId.toString();

    if (orderUserId !== userId) {
      throw new HttpError(403, "Unauthorized access to order");
    }

    if (order.paymentMethod !== "ONLINE") {
      throw new HttpError(400, "This order does not require online payment");
    }

    if (order.paymentStatus === "VERIFIED") {
      throw new HttpError(
        400,
        "Payment for this order has already been verified"
      );
    }

    if (!file) {
      throw new HttpError(400, "Receipt image is required");
    }

    const receiptImage = `/uploads/payments/${file.filename}`;

    const payment = await paymentRepository.createPayment({
      orderId: new mongoose.Types.ObjectId(data.orderId),
      userId: new mongoose.Types.ObjectId(userId),
      amount: order.totalAmount,
      paymentMethod: data.paymentMethod || "Online Transfer",
      receiptImage,
      notes: data.notes,
      status: "PENDING",
    });

    return payment;
  }

  async getPaymentById(id: string) {
    const payment = await paymentRepository.getPaymentById(id);
    if (!payment) {
      throw new HttpError(404, "Payment not found");
    }
    return payment;
  }

  async getOrderPayment(orderId: string) {
    const payment = await paymentRepository.getOrderPayment(orderId);
    if (!payment) {
      throw new HttpError(404, "No payment found for this order");
    }
    return payment;
  }

  async getUserPayments(userId: string) {
    return await paymentRepository.getUserPayments(userId);
  }

  async getRejectedPayments(orderId: string) {
    return await paymentRepository.getRejectedPaymentsByOrder(orderId);
  }

  // Admin Methods
  async getPendingPayments() {
    return await paymentRepository.getPendingPayments();
  }

  async getAllPayments(filters: GetPaymentsFilterDTOType) {
    const page = parseInt(filters.page || "1");
    const limit = parseInt(filters.limit || "10");
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    if (page < 1) {
      throw new HttpError(400, "Page must be greater than 0");
    }

    if (limit < 1 || limit > 100) {
      throw new HttpError(400, "Limit must be between 1 and 100");
    }

    return await paymentRepository.getAllPayments({
      status: filters.status,
      page,
      limit,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    });
  }

  async verifyPayment(
    paymentId: string,
    adminId: string,
    data: VerifyPaymentDTOType
  ) {
    const payment = await paymentRepository.getPaymentById(paymentId);
    if (!payment) {
      throw new HttpError(404, "Payment not found");
    }

    if (payment.status !== "PENDING") {
      throw new HttpError(400, "Payment has already been processed");
    }

    const orderId =
      payment.orderId instanceof mongoose.Types.ObjectId
        ? payment.orderId.toString()
        : (payment.orderId as any)._id.toString();

    const order = await orderRepository.getOrderById(orderId);

    if (data.status === "VERIFIED") {
      const otp = generateOTP();

      const updatedPayment = await paymentRepository.updatePaymentStatus(
        paymentId,
        {
          status: "VERIFIED",
          verifiedBy: new mongoose.Types.ObjectId(adminId),
          verifiedAt: new Date(),
          verificationNotes: data.verificationNotes,
        }
      );

      if (order) {
        await orderRepository.updateOrder(order._id.toString(), {
          paymentStatus: "VERIFIED",
          status: "CONFIRMED",
          otp: otp,
        });
      }

      return {
        payment: updatedPayment,
        order: await orderRepository.getOrderById(orderId),
        message: "Payment verified and OTP generated",
      };
    } else {
      const updatedPayment = await paymentRepository.updatePaymentStatus(
        paymentId,
        {
          status: "REJECTED",
          verifiedBy: new mongoose.Types.ObjectId(adminId),
          verifiedAt: new Date(),
          verificationNotes: data.verificationNotes,
        }
      );

      if (order) {
        await orderRepository.updateOrder(order._id.toString(), {
          paymentStatus: "FAILED",
          otp: undefined,
        });
      }

      return {
        payment: updatedPayment,
        message: "Payment rejected. User can resubmit receipt.",
      };
    }
  }
}
