import { OrderModel, IOrder } from "../models/order.model";

export interface IOrderRepository {
  createOrder(data: Partial<IOrder>): Promise<IOrder>;
  getOrderById(id: string): Promise<IOrder | null>;
  getUserOrders(userId: string): Promise<IOrder[]>;
  getStoreOrders(storeId: string): Promise<IOrder[]>;
  updateOrderStatus(id: string, status: string): Promise<IOrder | null>;
  updateOrder(id: string, data: Partial<IOrder>): Promise<IOrder | null>;
  getOrderByPickupCode(pickupCode: string): Promise<IOrder | null>;
  deleteOrder(id: string): Promise<boolean>;
  getOrdersByStatus(status: string, storeId?: string): Promise<IOrder[]>;
}

export class OrderRepository implements IOrderRepository {
  async createOrder(data: Partial<IOrder>): Promise<IOrder> {
    const order = new OrderModel(data);
    return await order.save();
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    return await OrderModel.findById(id)
      .populate("userId")
      .populate("storeId")
      .populate("items.productId");
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    return await OrderModel.find({ userId })
      .populate("userId")
      .populate("storeId")
      .populate("items.productId")
      .sort({ createdAt: -1 });
  }

  async getStoreOrders(storeId: string): Promise<IOrder[]> {
    return await OrderModel.find({ storeId })
      .populate("userId")
      .populate("storeId")
      .populate("items.productId")
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(id: string, status: string): Promise<IOrder | null> {
    return await OrderModel.findByIdAndUpdate(id, { status }, { new: true })
      .populate("userId")
      .populate("storeId")
      .populate("items.productId");
  }

  async updateOrder(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    return await OrderModel.findByIdAndUpdate(id, data, { new: true })
      .populate("userId")
      .populate("storeId")
      .populate("items.productId");
  }

  async getOrderByPickupCode(pickupCode: string): Promise<IOrder | null> {
    return await OrderModel.findOne({ pickupCode })
      .populate("userId")
      .populate("storeId")
      .populate("items.productId");
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await OrderModel.findByIdAndDelete(id);
    return !!result;
  }

  async getOrdersByStatus(status: string, storeId?: string): Promise<IOrder[]> {
    const query: any = { status };
    if (storeId) {
      query.storeId = storeId;
    }
    return await OrderModel.find(query)
      .populate("userId")
      .populate("storeId")
      .populate("items.productId")
      .sort({ createdAt: -1 });
  }
}
