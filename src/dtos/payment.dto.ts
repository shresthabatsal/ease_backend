import z from "zod";

export const SubmitPaymentReceiptDTO = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  paymentMethod: z.string().min(1, "Payment method is required").optional(),
  notes: z.string().optional().describe("Optional notes about the payment"),
});

export const VerifyPaymentDTO = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  verificationNotes: z.string().optional(),
});

export const GetPaymentsFilterDTO = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  sortBy: z
    .enum(["createdAt", "amount", "status"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type SubmitPaymentReceiptDTOType = z.infer<
  typeof SubmitPaymentReceiptDTO
>;
export type VerifyPaymentDTOType = z.infer<typeof VerifyPaymentDTO>;
export type GetPaymentsFilterDTOType = z.infer<typeof GetPaymentsFilterDTO>;
