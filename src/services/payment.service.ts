import { PaymentRepository } from "../repositories/payment.repository";
import { OrderRepository } from "../repositories/order.repository";
import { HttpError } from "../errors/http.error";
import {
  CreatePaymentDTOType,
  UpdatePaymentStatusDTOType,
} from "../dtos/payment.dto";
import crypto from "crypto";
import mongoose from "mongoose";
import { ProductModel } from "../models/product.model";

const paymentRepository = new PaymentRepository();
const orderRepository = new OrderRepository();

export class PaymentService {
  async createPayment(userId: string, data: CreatePaymentDTOType) {
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

    if (order.status === "CANCELLED") {
      throw new HttpError(400, "Cannot pay for cancelled order");
    }

    if (order.paymentStatus === "COMPLETED") {
      throw new HttpError(400, "Payment already completed for this order");
    }

    // Only allow ESEWA and KHALTI for online payment
    if (data.method !== "ESEWA" && data.method !== "KHALTI") {
      throw new HttpError(400, "Invalid payment method");
    }

    const transactionId = this.generateTransactionId();

    const payment = await paymentRepository.createPayment({
      orderId: new mongoose.Types.ObjectId(data.orderId),
      userId: new mongoose.Types.ObjectId(userId),
      amount: order.totalAmount,
      method: data.method,
      status: "PENDING",
      transactionId,
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

  async updatePaymentStatus(id: string, data: UpdatePaymentStatusDTOType) {
    const payment = await paymentRepository.getPaymentById(id);
    if (!payment) {
      throw new HttpError(404, "Payment not found");
    }

    const updatedPayment = await paymentRepository.updatePaymentStatus(id, {
      status: data.status,
      transactionId: data.transactionId,
    });

    if (data.status === "COMPLETED") {
      // Update order payment status and confirm order
      const orderId =
        payment.orderId instanceof mongoose.Types.ObjectId
          ? payment.orderId.toString()
          : (payment.orderId as any)._id.toString();

      const order = await orderRepository.getOrderById(orderId);

      if (order) {
        await orderRepository.updateOrder(order._id.toString(), {
          paymentStatus: "COMPLETED",
          status: "CONFIRMED",
        });
      }
    }

    if (data.status === "FAILED") {
      // Restore product quantities on payment failure
      const orderId =
        payment.orderId instanceof mongoose.Types.ObjectId
          ? payment.orderId.toString()
          : (payment.orderId as any)._id.toString();

      const order = await orderRepository.getOrderById(orderId);

      if (order) {
        for (const item of order.items) {
          const product = await ProductModel.findById(item.productId);
          if (product) {
            await ProductModel.findByIdAndUpdate(product._id, {
              quantity: product.quantity + item.quantity,
            });
          }
        }

        // Cancel order if payment fails
        await orderRepository.updateOrder(order._id.toString(), {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        });
      }
    }

    return updatedPayment;
  }

  async getUserPayments(userId: string) {
    return await paymentRepository.getUserPayments(userId);
  }

  private generateTransactionId(): string {
    return `TXN${Date.now()}${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;
  }
}
