import { apiClient } from "@/shared/lib/apiClient";
import { Item, CreateItemDTO } from "../types/item.types";

export const itemsApi = {
    getAll: async (): Promise<Item[]> => {
      const { data } = await apiClient.get("/items");
      return data;
    },
  
    getById: async (id: string): Promise<Item> => {
      const { data } = await apiClient.get(`/items/${id}`);
      return data;
    },
  
    create: async (payload: CreateItemDTO): Promise<Item> => {
      const { data } = await apiClient.post("/items", payload);
      return data;
    },
  
    compare: async (idA: string, idB: string): Promise<any> => {
      const { data } = await apiClient.get(`/items/compare?idA=${idA}&idB=${idB}`);
      return data;
    },
  };