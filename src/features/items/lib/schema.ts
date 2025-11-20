// import { z } from "zod";

// export const ItemResponse = z.object({
//     id: z.string(),
//     name: z.string(),
//     brand: z.string(),
//     category: z.string(),
//     price: z.number(),
//     rating: z.number().min(0).max(5),    
// })
// export type ItemResponse = z.infer<typeof ItemResponse>;

// export const CreateItemRequest = z.object({
//     name: z.string().min(1),
//     brand: z.string().min(1),
//     category: z.string().min(1),
//     price: z.number().positive(),
//     rating: z.number().min(0).max(5).optional(),
// })
// export type CreateItemRequest = z.infer<typeof CreateItemRequest>;