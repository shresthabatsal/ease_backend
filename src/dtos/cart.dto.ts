import z from "zod";

export const AddToCartDTO = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
});

export const UpdateCartDTO = z.object({
  quantity: z.number().positive("Quantity must be greater than 0"),
});

export type AddToCartDTOType = z.infer<typeof AddToCartDTO>;
export type UpdateCartDTOType = z.infer<typeof UpdateCartDTO>;
