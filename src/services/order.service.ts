import { OrderRepository } from "../repositories/order.repository";
import { CartRepository } from "../repositories/cart.repository";
import { ProductRepository } from "../repositories/product.repository";
import { StoreRepository } from "../repositories/store.repository";
import { NotificationService } from "./notification.service";
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
const notificationService = new NotificationService();

let wsService: any;

export function setOrderWebSocketService(ws: any) {
  wsService = ws;
}

function generatePickupCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to extract userId
function extractUserId(userField: any): string {
  if (!userField) return "";
  if (typeof userField === "string") {
    return userField;
  }
  if (userField._id) {
    return userField._id.toString();
  }
  if (userField.toString) {
    return userField.toString();
  }
  return "";
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

    // SEND ORDER CREATED NOTIFICATION
    try {
      console.log("Sending ORDER_CREATED notification to user:", userId);

      // Create notification in database
      await notificationService.createNotification(
        userId,
        order._id.toString(),
        "ORDER_CREATED",
        "Order Created 📦",
        "Your order has been created successfully. Please proceed with payment.",
        {
          pickupCode: order.pickupCode,
          pickupTime: order.pickupTime,
          pickupDate: order.pickupDate.toISOString().split("T")[0],
        }
      );

      // Send via WebSocket if available
      if (wsService) {
        await wsService.sendNotificationToUser(
          userId,
          "ORDER_CREATED",
          "Order Created 📦",
          "Your order has been created successfully. Please proceed with payment.",
          order._id.toString(),
          {
            pickupCode: order.pickupCode,
            pickupTime: order.pickupTime,
            pickupDate: order.pickupDate.toISOString().split("T")[0],
          }
        );
      }

      console.log("ORDER_CREATED notification sent successfully");
    } catch (error: any) {
      console.error("Error sending notification:", error.message);
    }

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

    const orderUserId = extractUserId(order.userId);

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
      const productId = extractUserId(item.productId);

      const product = await productRepository.getProductById(productId);

      if (product) {
        await productRepository.updateProduct(product._id.toString(), {
          quantity: product.quantity + item.quantity,
        });
      }
    }

    const cancelledOrder = await orderRepository.updateOrderStatus(
      id,
      "CANCELLED"
    );

    // CHECK IF UPDATE WAS SUCCESSFUL
    if (!cancelledOrder) {
      throw new HttpError(500, "Failed to cancel order");
    }

    // SEND ORDER CANCELLED NOTIFICATION
    try {
      await notificationService.createNotification(
        userId,
        id,
        "ORDER_CANCELLED",
        "Order Cancelled ❌",
        `Your order has been cancelled. Reason: ${
          data?.reason || "User requested"
        }`,
        {
          pickupCode: cancelledOrder.pickupCode,
        }
      );

      if (wsService) {
        await wsService.sendNotificationToUser(
          userId,
          "ORDER_CANCELLED",
          "Order Cancelled ❌",
          `Your order has been cancelled. Reason: ${
            data?.reason || "User requested"
          }`,
          id
        );
      }

      console.log("ORDER_CANCELLED notification sent successfully");
    } catch (error: any) {
      console.error("Error sending cancellation notification:", error.message);
    }

    return cancelledOrder;
  }

  // Admin Methods
  async adminUpdateOrderStatus(id: string, data: UpdateOrderStatusDTOType) {
    const order = await orderRepository.getOrderById(id);
    if (!order) {
      throw new HttpError(404, "Order not found");
    }

    const updatedOrder = await orderRepository.updateOrderStatus(
      id,
      data.status
    );

    // CHECK IF UPDATE WAS SUCCESSFUL
    if (!updatedOrder) {
      throw new HttpError(500, "Failed to update order status");
    }

    // SEND STATUS UPDATE NOTIFICATION
    try {
      const userId = extractUserId(order.userId);

      let title = "";
      let message = "";
      let notificationType = "";

      if (data.status === "READY_FOR_COLLECTION") {
        title = "Ready for Collection 🎉";
        message =
          "Your order is ready! Come pick it up using your OTP and pickup code.";
        notificationType = "READY_FOR_COLLECTION";
      } else if (data.status === "COLLECTED") {
        title = "Order Collected ✅";
        message = "Thank you! Your order has been collected successfully.";
        notificationType = "ORDER_COLLECTED";
      } else if (data.status === "CANCELLED") {
        title = "Order Cancelled ❌";
        message = "Your order has been cancelled.";
        notificationType = "ORDER_CANCELLED";
      }

      if (title && notificationType) {
        await notificationService.createNotification(
          userId,
          id,
          notificationType,
          title,
          message,
          {
            pickupCode: updatedOrder.pickupCode,
            otp: updatedOrder.otp,
            pickupTime: updatedOrder.pickupTime,
            pickupDate: updatedOrder.pickupDate.toISOString().split("T")[0],
          }
        );

        if (wsService) {
          await wsService.sendNotificationToUser(
            userId,
            notificationType,
            title,
            message,
            id,
            {
              pickupCode: updatedOrder.pickupCode,
              otp: updatedOrder.otp,
              pickupTime: updatedOrder.pickupTime,
              pickupDate: updatedOrder.pickupDate.toISOString().split("T")[0],
            }
          );
        }

        console.log(`${notificationType} notification sent successfully`);
      }
    } catch (error: any) {
      console.error("Error sending status notification:", error.message);
    }

    return updatedOrder;
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

    const collectedOrder = await orderRepository.updateOrderStatus(
      id,
      "COLLECTED"
    );

    // CHECK IF UPDATE WAS SUCCESSFUL
    if (!collectedOrder) {
      throw new HttpError(500, "Failed to collect order");
    }

    // SEND ORDER COLLECTED NOTIFICATION
    try {
      const userId = extractUserId(order.userId);

      await notificationService.createNotification(
        userId,
        id,
        "ORDER_COLLECTED",
        "Order Collected ✅",
        "Thank you! Your order has been collected successfully.",
        {
          pickupCode: collectedOrder.pickupCode,
        }
      );

      if (wsService) {
        await wsService.sendNotificationToUser(
          userId,
          "ORDER_COLLECTED",
          "Order Collected ✅",
          "Thank you! Your order has been collected successfully.",
          id
        );
      }

      console.log("ORDER_COLLECTED notification sent successfully");
    } catch (error: any) {
      console.error("Error sending collection notification:", error.message);
    }

    return collectedOrder;
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
