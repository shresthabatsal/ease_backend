import z from "zod";

export const CreateOrderDTO = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  paymentMethod: z.enum(["CASH_ON_PICKUP", "ESEWA", "KHALTI"]),
});

export const BuyNowDTO = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  storeId: z.string().min(1, "Store ID is required"),
  paymentMethod: z.enum(["CASH_ON_PICKUP", "ESEWA", "KHALTI"]),
});

export const CancelOrderDTO = z.object({
  reason: z.string().optional(),
});

export const VerifyOtpDTO = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const UpdateOrderStatusDTO = z.object({
  status: z.enum(["READY_FOR_COLLECTION", "COLLECTED", "CANCELLED"]),
});

export type CreateOrderDTOType = z.infer<typeof CreateOrderDTO>;
export type BuyNowDTOType = z.infer<typeof BuyNowDTO>;
export type CancelOrderDTOType = z.infer<typeof CancelOrderDTO>;
export type VerifyOtpDTOType = z.infer<typeof VerifyOtpDTO>;
export type UpdateOrderStatusDTOType = z.infer<typeof UpdateOrderStatusDTO>;
