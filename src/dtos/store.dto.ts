import z from "zod";

export const CreateStoreDTO = z.object({
  storeName: z.string().min(1, "Store name is required"),
  location: z.string().min(1, "Location is required"),
  pickupInstructions: z.string().min(1, "Pickup instructions are required"),
});

export const UpdateStoreDTO = CreateStoreDTO.partial();

export type CreateStoreDTOType = z.infer<typeof CreateStoreDTO>;
export type UpdateStoreDTOType = z.infer<typeof UpdateStoreDTO>;
