import z from "zod";

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const CreateOrderDTO = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  pickupDate: z
    .string()
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Invalid pickup date")
    .refine((date) => {
      const d = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Pickup date must be today or later"),
  pickupTime: z
    .string()
    .regex(timeRegex, "Pickup time must be in HH:MM format (24-hour)"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

export const BuyNowDTO = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  storeId: z.string().min(1, "Store ID is required"),
  pickupDate: z
    .string()
    .refine((date) => {
      const d = new Date(date);
      return !isNaN(d.getTime());
    }, "Invalid pickup date")
    .refine((date) => {
      const d = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return d >= today;
    }, "Pickup date must be today or later"),
  pickupTime: z
    .string()
    .regex(timeRegex, "Pickup time must be in HH:MM format (24-hour)"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
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
