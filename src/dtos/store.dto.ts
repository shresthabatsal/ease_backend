import z from "zod";

export const CreateStoreDTO = z.object({
  storeName: z.string().min(1, "Store name is required"),
  location: z.string().min(1, "Location is required"),
  coordinates: z.object({
    latitude: z.coerce.number().min(-90).max(90, "Invalid latitude"),
    longitude: z.coerce.number().min(-180).max(180, "Invalid longitude"),
  }),
  pickupInstructions: z.string().min(1, "Pickup instructions are required"),
});

export const UpdateStoreDTO = CreateStoreDTO.partial();

export type CreateStoreDTOType = z.infer<typeof CreateStoreDTO>;
export type UpdateStoreDTOType = z.infer<typeof UpdateStoreDTO>;
