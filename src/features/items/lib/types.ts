import { z } from "zod";

export const ItemSchema = z.object({
  id: z.uuid(),
  created_at: z.iso.datetime().or(z.date()),
  updated_at: z.iso.datetime().or(z.date()),
  status: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  source_url: z.string().url().nullable(),
  sub_title: z.string().nullable(),
  fit: z.string().nullable(),
  materials: z.string().nullable(),
  department: z.string().nullable(),
  collection: z.string().nullable(),
  price: z.number().nullable(),
  details: z.array(z.string()),
  title: z.string(),
  brand_id: z.uuid(),
  category_id: z.uuid(),
  image_url: z.string().url(),
  contributor_id: z.uuid(),
  comment_count: z.number().int().min(0),
  view_count: z.number().int().min(0),
  like_count: z.number().int().min(0),
});

export type Item = z.infer<typeof ItemSchema>;

