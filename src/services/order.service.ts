import { OrderRepository } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { StoreRepository } from "../repositories/store.repository";
import { HttpError } from "../errors/http.error";
import {
  CreateOrderDTOType,
  BuyNowDTOType,
  CancelOrderDTOType,
  UpdateOrderStatusDTOType,
  VerifyOtpDTOType,
} from "../dtos/order.dto";
import mongoose from "mongoose";

const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const storeRepository = new StoreRepository();

function generatePickupCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class OrderService {
  async createOrderFromCart(userId: string, data: CreateOrderDTOType) {
    const store = await storeRepository.getStoreById(data.storeId);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }

    const cart = await cartRepository.getUserCart(userId);
    if (cart.length === 0) {
      throw new HttpError(400, "Cart is empty");
    }

    return await this.processOrder(
      userId,
      cart,
      data.storeId,
      data.pickupDate,
      data.pickupTime,
      data.notes
    );
  }

  async buyNow(userId: string, data: BuyNowDTOType) {
    const product = await productRepository.getProductById(data.productId);
    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    if (product.quantity < data.quantity) {
      throw new HttpError(400, "Insufficient stock available");
    }

    const store = await storeRepository.getStoreById(data.storeId);
    if (!store) {
      throw new HttpError(404, "Store not found");
    }

    const tempCart = [
      {
        productId: product,
        quantity: data.quantity,
      },
    ];

    return await this.processOrder(
      userId,
      tempCart,
      data.storeId,
      data.pickupDate,
      data.pickupTime,
      data.notes
    );
  }

  private async processOrder(
    userId: string,
    cartItems: any[],
    storeId: string,
    pickupDate: string,
    pickupTime: string,
    notes?: string
  ) {
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const product = cartItem.productId._id
        ? cartItem.productId
        : await productRepository.getProductById(cartItem.productId.toString());

      if (!product) {
        throw new HttpError(404, "Product not found");
      }

      if (product.quantity < cartItem.quantity) {
        throw new HttpError(400, `Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        quantity: cartItem.quantity,
        price: product.price,
      });

      // Reduce product quantity
      await productRepository.updateProduct(product._id.toString(), {
        quantity: product.quantity - cartItem.quantity,
      });
    }

    const pickupCodeStr = generatePickupCode();

    // Parse pickup date properly
    const pickupDateObj = new Date(pickupDate);
    if (isNaN(pickupDateObj.getTime())) {
      throw new HttpError(400, "Invalid pickup date format");
    }

    // Validate pickup time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(pickupTime)) {
      throw new HttpError(
        400,
        "Invalid pickup time format. Use HH:MM (24-hour)"
      );
    }

    const orderData: Partial<any> = {
      userId: new mongoose.Types.ObjectId(userId),
      storeId: new mongoose.Types.ObjectId(storeId),
      items: orderItems.map((item) => ({
        productId: new mongoose.Types.ObjectId(
          item.productId._id || item.productId
        ),
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      pickupCode: pickupCodeStr,
      pickupDate: pickupDateObj,
      pickupTime: pickupTime,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
      status: "PENDING",
    };

    // Add notes only if provided
    if (notes) {
      orderData.notes = notes;
    }

    console.log(
      "Creating order with data:",
      JSON.stringify(orderData, null, 2)
    );

    const order = await orderRepository.createOrder(orderData);

    // Clear cart only if order was created from cart
    if (cartItems.length > 0 && cartItems[0]._id) {
      await cartRepository.clearUserCart(userId);
    }

    return order;
  }

  async getOrderById(id: string) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }
    return order;
  }

  async getUserOrders(userId: string) {
    return await orderRepository.getUserOrders(userId);
  }

  async getStoreOrders(storeId: string) {
    return await orderRepository.getStoreOrders(storeId);
  }

  async getOrdersByStatus(status: string, storeId?: string) {
    return await orderRepository.getOrdersByStatus(status, storeId);
  }

  async cancelOrder(id: string, userId: string, data?: CancelOrderDTOType) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    const orderUserId = (order.userId as any)._id
      ? (order.userId as any)._id.toString()
      : order.userId.toString();

    if (orderUserId !== userId) {
      throw new HttpError(403, "Unauthorized to cancel this order");
    }

    if (order.status === "COLLECTED" || order.status === "CANCELLED") {
      throw new HttpError(
        400,
        `Cannot cancel order with status ${order.status}`
      );
    }

    // Restore product quantities
    for (const item of order.items) {
      const productId = (item.productId as any)._id
        ? (item.productId as any)._id.toString()
        : item.productId.toString();

      const product = await productRepository.getProductById(productId);

      if (product) {
        await productRepository.updateProduct(product._id.toString(), {
          quantity: product.quantity + item.quantity,
        });
      }
    }

    return await orderRepository.updateOrderStatus(id, "CANCELLED");
  }

  // Admin Methods
  async adminUpdateOrderStatus(id: string, data: UpdateOrderStatusDTOType) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    return await orderRepository.updateOrderStatus(id, data.status);
  }

  async adminVerifyOtp(id: string, data: VerifyOtpDTOType) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    if (!order.otp) {
      throw new HttpError(400, "OTP has not been generated for this order");
    }

    if (order.otp !== data.otp) {
      throw new HttpError(400, "Invalid OTP");
    }

    if (order.status !== "READY_FOR_COLLECTION") {
      throw new HttpError(
        400,
        "Order must be ready for collection to verify OTP"
      );
    }

    return await orderRepository.updateOrderStatus(id, "COLLECTED");
  }

  async adminDeleteOrder(id: string) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    if (order.status !== "CANCELLED") {
      throw new HttpError(400, "Can only delete cancelled orders");
    }

    return await orderRepository.deleteOrder(id);
  }

  async adminGetStoreOrders(storeId: string) {
    return await orderRepository.getStoreOrders(storeId);
  }
}
