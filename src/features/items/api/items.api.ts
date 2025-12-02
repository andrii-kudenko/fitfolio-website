import { api } from "@/shared/lib/api";
import { Item, CreateItemDTO } from "../types/types";

export const itemsApi = {
    getAll: async (): Promise<Item[]> => {
      const { data } = await api.get("/items");
      return data;
    },
  
    getById: async (id: string): Promise<Item> => {
      const { data } = await api.get(`/items/${id}`);
      return data;
    },
  
    create: async (payload: CreateItemDTO): Promise<Item> => {
      const { data } = await api.post("/items", payload);
      return data;
    },
  
    compare: async (idA: string, idB: string): Promise<any> => {
      const { data } = await api.get(`/items/compare?idA=${idA}&idB=${idB}`);
      return data;
    },
  };