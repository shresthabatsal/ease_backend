import z from "zod";

export const CreateProductDTO = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().positive("Price must be positive"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategoryId: z.string().min(1, "Subcategory is required"),
  storeId: z.string().min(1, "Store is required"),
  quantity: z.coerce.number().nonnegative("Quantity must be non-negative"),
});

export const UpdateProductDTO = CreateProductDTO.partial();

export type CreateProductDTOType = z.infer<typeof CreateProductDTO>;
export type UpdateProductDTOType = z.infer<typeof UpdateProductDTO>;
