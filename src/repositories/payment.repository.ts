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
  getPendingPayments(): Promise<IPayment[]>;
  getRejectedPaymentsByOrder(orderId: string): Promise<IPayment[]>;
  getAllPayments(filters: {
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ payments: IPayment[]; total: number; pages: number }>;
}

export class PaymentRepository implements IPaymentRepository {
  async createPayment(data: Partial<IPayment>): Promise<IPayment> {
    const payment = new PaymentModel(data);
    return await payment.save();
  }

  async getPaymentById(id: string): Promise<IPayment | null> {
    return await PaymentModel.findById(id)
      .populate("orderId")
      .populate("userId")
      .populate("verifiedBy");
  }

  async getOrderPayment(orderId: string): Promise<IPayment | null> {
    return await PaymentModel.findOne({ orderId })
      .populate("orderId")
      .populate("userId")
      .populate("verifiedBy")
      .sort({ createdAt: -1 });
  }

  async updatePaymentStatus(
    id: string,
    data: Partial<IPayment>
  ): Promise<IPayment | null> {
    return await PaymentModel.findByIdAndUpdate(id, data, { new: true })
      .populate("orderId")
      .populate("userId")
      .populate("verifiedBy");
  }

  async getUserPayments(userId: string): Promise<IPayment[]> {
    return await PaymentModel.find({ userId })
      .populate("orderId")
      .populate("userId")
      .sort({ createdAt: -1 });
  }

  async getPendingPayments(): Promise<IPayment[]> {
    return await PaymentModel.find({ status: "PENDING" })
      .populate("orderId")
      .populate("userId")
      .sort({ submittedAt: -1 });
  }

  async getRejectedPaymentsByOrder(orderId: string): Promise<IPayment[]> {
    return await PaymentModel.find({ orderId, status: "REJECTED" })
      .populate("orderId")
      .populate("userId")
      .populate("verifiedBy")
      .sort({ updatedAt: -1 });
  }

  async getAllPayments(filters: {
    status?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{ payments: IPayment[]; total: number; pages: number }> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (filters.page - 1) * filters.limit;

    const sortDirection = filters.sortOrder === "asc" ? 1 : -1;
    const sortObject: any = {};
    sortObject[filters.sortBy] = sortDirection;

    // Execute query
    const payments = await PaymentModel.find(query)
      .populate("orderId")
      .populate("userId")
      .populate("verifiedBy")
      .sort(sortObject)
      .skip(skip)
      .limit(filters.limit);

    // Get total count
    const total = await PaymentModel.countDocuments(query);

    return {
      payments,
      total,
      pages: Math.ceil(total / filters.limit),
    };
  }
}
