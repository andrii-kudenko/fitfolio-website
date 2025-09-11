import { ItemDTO } from "./types";
import { api } from "@/lib/fetch";

export async function getItems(): Promise<ItemDTO[]> {
  return api("/items");
}
export async function getItem(id: string): Promise<ItemDTO> {
  return api(`/items/${id}`);
}