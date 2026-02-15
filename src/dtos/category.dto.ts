import z from "zod";

export const CreateCategoryDTO = z.object({
  name: z.string().min(1, "Category name is required"),
});

export const UpdateCategoryDTO = CreateCategoryDTO.partial();

export type CreateCategoryDTOType = z.infer<typeof CreateCategoryDTO>;
export type UpdateCategoryDTOType = z.infer<typeof UpdateCategoryDTO>;
