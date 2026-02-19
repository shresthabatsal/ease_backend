import z from "zod";

export const CreatePaymentDTO = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  method: z.enum(["ESEWA", "KHALTI"]),
});

export const UpdatePaymentStatusDTO = z.object({
  status: z.enum(["COMPLETED", "FAILED"]),
  transactionId: z.string().optional(),
});

export type CreatePaymentDTOType = z.infer<typeof CreatePaymentDTO>;
export type UpdatePaymentStatusDTOType = z.infer<typeof UpdatePaymentStatusDTO>;
