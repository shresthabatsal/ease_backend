import { PaymentModel, IPayment } from "../models/payment.model";

export interface IPaymentRepository {
  createPayment(data: Partial<IPayment>): Promise<IPayment>;
  getPaymentById(id: string): Promise<IPayment | null>;
  getOrderPayment(orderId: string): Promise<IPayment | null>;
  updatePaymentStatus(
    id: string,
    data: Partial<IPayment>
  ): Promise<IPayment | null>;
  getUserPayments(userId: string): Promise<IPayment[]>;
}

export class PaymentRepository implements IPaymentRepository {
  async createPayment(data: Partial<IPayment>): Promise<IPayment> {
    const payment = new PaymentModel(data);
    return await payment.save();
  }

  async getPaymentById(id: string): Promise<IPayment | null> {
    return await PaymentModel.findById(id)
      .populate("orderId")
      .populate("userId");
  }

  async getOrderPayment(orderId: string): Promise<IPayment | null> {
    return await PaymentModel.findOne({ orderId })
      .populate("orderId")
      .populate("userId");
  }

  async updatePaymentStatus(
    id: string,
    data: Partial<IPayment>
  ): Promise<IPayment | null> {
    return await PaymentModel.findByIdAndUpdate(id, data, { new: true })
      .populate("orderId")
      .populate("userId");
  }

  async getUserPayments(userId: string): Promise<IPayment[]> {
    return await PaymentModel.find({ userId })
      .populate("orderId")
      .populate("userId")
      .sort({ createdAt: -1 });
  }
}
