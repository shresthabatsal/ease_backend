import z from "zod";

export const CreateSubcategoryDTO = z.object({
  name: z.string().min(1, "Subcategory name is required"),
  categoryId: z.string().min(1, "Category ID is required"),
});

export const UpdateSubcategoryDTO = CreateSubcategoryDTO.partial();

export type CreateSubcategoryDTOType = z.infer<typeof CreateSubcategoryDTO>;
export type UpdateSubcategoryDTOType = z.infer<typeof UpdateSubcategoryDTO>;
