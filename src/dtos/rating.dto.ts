import z from "zod";

export const CreateRatingDTO = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
  review: z
    .string()
    .min(1, "Review is required")
    .max(500, "Review must be less than 500 characters"),
});

export const UpdateRatingDTO = CreateRatingDTO.partial();

export type CreateRatingDTOType = z.infer<typeof CreateRatingDTO>;
export type UpdateRatingDTOType = z.infer<typeof UpdateRatingDTO>;
